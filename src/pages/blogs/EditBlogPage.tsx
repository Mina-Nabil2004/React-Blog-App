import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { updateBlogSchema, type UpdateBlogFormData } from '../../schemas/blog.schemas';
import { apiGetBlogById, apiUpdateBlog, apiAddTag, apiRemoveTag } from '../../api/blogs';
import { apiGetTags, apiCreateTag } from '../../api/tags';
import type { Blog, Tag } from '../../types';
import { resolveImageUrl } from '../../utils/imageUrl';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/forms/ImageUpload';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { X, Plus } from 'lucide-react';

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateBlogFormData>({ resolver: zodResolver(updateBlogSchema) });

  useEffect(() => {
    if (!id) return;
    Promise.all([apiGetBlogById(id), apiGetTags()])
      .then(([b, tags]) => {
        setBlog(b);
        setAllTags(Array.isArray(tags) ? tags : []);
        setSelectedTags(Array.isArray(b.tags) ? b.tags : []);
        reset({ title: b.title, content: b.content, published: b.published });
        document.title = `Edit: ${b.title} — BlogApp`;
      })
      .catch(() => {
        toast.error('Failed to load blog');
        navigate('/dashboard', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate, reset]);

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

  const onSubmit = async (data: UpdateBlogFormData) => {
    if (!blog) return;
    setSubmitting(true);
    try {
      // Update blog content
      const fd = new FormData();
      if (data.title)   fd.append('title', data.title);
      if (data.content) fd.append('content', data.content);
      if (data.published !== undefined) fd.append('published', String(data.published));
      if (imageFile) fd.append('image', imageFile);
      await apiUpdateBlog(blog.blogID, fd);

      // Diff tags
      const originalIds = new Set(blog.tags.map((t) => t.tagID));
      const newIds = new Set(selectedTags.map((t) => t.tagID));
      const toAdd    = selectedTags.filter((t) => !originalIds.has(t.tagID));
      const toRemove = blog.tags.filter((t) => !newIds.has(t.tagID));

      await Promise.all([
        ...toAdd.map((t) => apiAddTag(blog.blogID, t.tagID)),
        ...toRemove.map((t) => apiRemoveTag(blog.blogID, t.tagID)),
      ]);

      toast.success('Blog updated!');
      navigate(`/blogs/${blog.blogID}`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to update blog'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" fullPage />;
  if (!blog) return null;

  const unselectedTags = allTags.filter((t) => !selectedTags.find((s) => s.tagID === t.tagID));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content-primary">Edit blog</h1>
        <p className="mt-1 text-sm text-content-secondary">Update your blog post details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Cover image */}
        <ImageUpload
          value={resolveImageUrl(blog.imageUrl)}
          onChange={setImageFile}
        />

        {/* Title */}
        <Input
          label="Title"
          placeholder="Blog title…"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Content */}
        <Textarea
          label="Content"
          placeholder="Blog content…"
          rows={14}
          error={errors.content?.message}
          {...register('content')}
        />

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-content-primary">Tags</label>

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
            <p className="text-sm font-medium text-content-primary">Published</p>
            <p className="text-xs text-content-secondary">
              Uncheck to move back to draft.
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
