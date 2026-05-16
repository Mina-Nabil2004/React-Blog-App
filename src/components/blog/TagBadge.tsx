interface Props {
  name: string;
}

export default function TagBadge({ name }: Props) {
  return (
    <span className="inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
      {name}
    </span>
  );
}
