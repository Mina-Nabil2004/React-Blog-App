import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createBlogSchema, type CreateBlogFormData } from '../../schemas/blog.schemas';
import { apiCreateBlog, apiAddTag } from '../../api/blogs';
import { apiGetTags, apiCreateTag } from '../../api/tags';
import type { Tag } from '../../types';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/forms/ImageUpload';
import { X, Plus } from 'lucide-react';

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'New Blog — BlogApp';
    apiGetTags().then((data) => setAllTags(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBlogFormData>({ resolver: zodResolver(createBlogSchema) });

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.tagID === tag.tagID)
        ? prev.filter((t) => t.tagID !== tag.tagID)
        : [...prev, tag],
    );
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    try {
      const tag = await apiCreateTag(name);
      setAllTags((prev) => [...prev, tag]);
      setSelectedTags((prev) => [...prev, tag]);
      setNewTagName('');
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const onSubmit = async (data: CreateBlogFormData) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('content', data.content);
      fd.append('published', String(data.published ?? false));
      if (imageFile) fd.append('image', imageFile);

      const blog = await apiCreateBlog(fd);

      // Attach selected tags
      if (selectedTags.length > 0) {
        await Promise.all(selectedTags.map((t) => apiAddTag(blog.blogID, t.tagID)));
      }

      toast.success('Blog created!');
      navigate(`/blogs/${blog.blogID}`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create blog'));
    } finally {
      setSubmitting(false);
    }
  };

  const unselectedTags = allTags.filter(
    (t) => !selectedTags.find((s) => s.tagID === t.tagID),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content-primary">Write a new blog</h1>
        <p className="mt-1 text-sm text-content-secondary">
          Share your ideas, stories, and insights with the world.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Cover image */}
        <ImageUpload onChange={setImageFile} />

        {/* Title */}
        <Input
          label="Title"
          placeholder="Give your blog a compelling title…"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Content */}
        <Textarea
          label="Content"
          placeholder="Write your blog content here…"
          rows={14}
          error={errors.content?.message}
          {...register('content')}
        />

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-content-primary">Tags</label>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((t) => (
                <span
                  key={t.tagID}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
                >
                  {t.name}
                  <button type="button" onClick={() => toggleTag(t)} className="hover:text-primary-900">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Available tags */}
          {unselectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unselectedTags.map((t) => (
                <button
                  key={t.tagID}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className="rounded-full border border-surface-border bg-white px-3 py-1 text-xs font-medium text-content-secondary hover:border-primary-400 hover:text-primary-600 transition-colors"
                >
                  + {t.name}
                </button>
              ))}
            </div>
          )}

          {/* Create new tag */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
              placeholder="New tag name…"
              className="flex-1 rounded-xl border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={creatingTag}
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
            >
              <Plus size={14} /> Add
            </Button>
          </div>
        </div>

        {/* Publish toggle */}
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-border bg-white p-4">
          <input type="checkbox" className="h-4 w-4 rounded accent-primary-500" {...register('published')} />
          <div>
            <p className="text-sm font-medium text-content-primary">Publish immediately</p>
            <p className="text-xs text-content-secondary">
              Your blog will be submitted for approval and visible once approved.
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Blog
          </Button>
        </div>
      </form>
    </div>
  );
}
