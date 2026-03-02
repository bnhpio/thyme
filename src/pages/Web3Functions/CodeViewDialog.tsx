import { useAction } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from '@/components/ui/shadcn-io/code-block';
import { Skeleton } from '@/components/ui/skeleton';
import { useModal } from '@/hooks/use-modal';

interface CodeViewContentProps {
  storageId: Id<'_storage'>;
  mode?: 'code' | 'schema';
}

// Internal content component with lazy loading
function CodeViewContent({ storageId, mode = 'code' }: CodeViewContentProps) {
  const getTaskCode = useAction(api.action.task.getTaskCode);
  const getTaskSchema = useAction(api.action.task.getTaskSchema);
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setIsLoading(true);
      setError(null);
      try {
        const content =
          mode === 'schema'
            ? await getTaskSchema({ storageId })
            : await getTaskCode({ storageId });
        if (!cancelled) {
          setCode(content);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load content',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [storageId, mode, getTaskCode, getTaskSchema]);

  const language: BundledLanguage = mode === 'schema' ? 'json' : 'typescript';
  const filename = mode === 'schema' ? 'schema.json' : 'source.ts';
  const codeData = code
    ? [
        {
          language,
          filename,
          code,
        },
      ]
    : [];

  return (
    <div className="flex-1 min-h-0 space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">{error}</div>
      ) : code ? (
        <CodeBlock
          data={codeData}
          defaultValue={language}
          className="flex h-full min-h-0 flex-col"
        >
          <CodeBlockHeader>
            <CodeBlockFiles>
              {(item) => (
                <CodeBlockFilename key={item.language} value={item.language}>
                  {item.filename}
                </CodeBlockFilename>
              )}
            </CodeBlockFiles>
            <div className="ml-auto" />
            <CodeBlockCopyButton />
          </CodeBlockHeader>
          <CodeBlockBody className="flex-1 min-h-0 overflow-auto">
            {(item) => (
              <CodeBlockItem
                key={item.language}
                value={item.language}
                className="h-full"
              >
                <CodeBlockContent language={item.language as BundledLanguage}>
                  {item.code}
                </CodeBlockContent>
              </CodeBlockItem>
            )}
          </CodeBlockBody>
        </CodeBlock>
      ) : null}
    </div>
  );
}

// Modal content wrapper using useModal
export function CodeViewModalContent({
  storageId,
  mode = 'code',
}: {
  storageId: Id<'_storage'>;
  mode?: 'code' | 'schema';
}) {
  return <CodeViewContent storageId={storageId} mode={mode} />;
}

// Trigger component for backward compatibility
interface CodeViewDialogProps {
  storageId: Id<'_storage'>;
  title: string;
  mode?: 'code' | 'schema';
  trigger: React.ReactNode;
}

export function CodeViewDialog({
  storageId,
  title,
  mode = 'code',
  trigger,
}: CodeViewDialogProps) {
  const { open } = useModal();

  const handleClick = () => {
    open({
      title,
      description:
        mode === 'schema'
          ? 'View the schema definition for this function'
          : 'View the code for this function',
      content: <CodeViewModalContent storageId={storageId} mode={mode} />,
      className: 'flex max-h-[90vh] flex-col sm:max-w-4xl',
    });
  };

  return <div onClick={handleClick}>{trigger}</div>;
}
