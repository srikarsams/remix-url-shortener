import type { url } from '@prisma/client';

type LinkCardProps = {
  url: url;
  isOpen: boolean;
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

export default function LinkCard({ url, isOpen }: LinkCardProps) {
  return (
    <div className={`${isOpen ? 'h-full' : 'h-0'} overflow-hidden`}>
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
    </div>
  );
}
