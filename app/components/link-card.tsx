import type { url } from '@prisma/client';

type LinkCardProps = {
  url: url;
  isOpen: boolean;
  onEditClick: (url: url) => void;
};

function LinkItem({
  name,
  value,
  isUrl = false,
}: {
  name: string;
  value: string;
  isUrl?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <p className="text-xs font-bold pb-1">{name}</p>
      {isUrl ? (
        <a href={value} className="text-xs">
          {value}
        </a>
      ) : (
        <p className="text-xs">{value}</p>
      )}
    </div>
  );
}

export default function LinkCard({ url, isOpen, onEditClick }: LinkCardProps) {
  return (
    <div className={`${isOpen ? 'h-full' : 'h-0'} overflow-hidden relative`}>
      <div
        className={`grid grid-cols-2 justify-between gap-1 gap-y-4 py-4 px-2 border-2 border-collapse`}
      >
        <LinkItem name="Name:" value={url.name} />
        <LinkItem name="URL:" value={url.url} isUrl={false} />
        <LinkItem
          name="Created at:"
          value={new Date(url.createdAt).toISOString()}
        />
        <LinkItem name="Short URL:" value={`/${url.slug}`} isUrl={false} />
      </div>
      <div className="text-center mt-3 absolute -top-3 right-2">
        <button
          className="text-xs hover:underline pr-2"
          onClick={() => onEditClick(url)}
        >
          Edit
        </button>

        <form method="post" className="inline">
          <input type="hidden" name="_method" value="delete" />
          <input type="hidden" name="urlId" value={url.id} />
          <button
            type="submit"
            className="text-xs hover:underline text-red-400"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
