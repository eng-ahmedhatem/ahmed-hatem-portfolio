interface StructuredDataProps {
  data: Record<string, unknown> | readonly Record<string, unknown>[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
