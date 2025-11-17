import { useAction } from 'convex/react';
import { useState } from 'react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [isOpen, setIsOpen] = useState(false);
  const getTaskCode = useAction(api.action.task.getTaskCode);
  const getTaskSchema = useAction(api.action.task.getTaskSchema);
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !code) {
      setIsLoading(true);
      setError(null);
      try {
        const content =
          mode === 'schema'
            ? await getTaskSchema({ storageId })
            : await getTaskCode({ storageId });
        setCode(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'schema'
              ? 'View the schema definition for this function'
              : 'View the code for this function'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 space-y-4 overflow-scroll">
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
                    <CodeBlockFilename
                      key={item.language}
                      value={item.language}
                    >
                      {item.filename}
                    </CodeBlockFilename>
                  )}
                </CodeBlockFiles>
                <div className="ml-auto" />
                <CodeBlockCopyButton />
              </CodeBlockHeader>
              <CodeBlockBody className="flex-1 min-h-0 overflow-hidden">
                {(item) => (
                  <CodeBlockItem
                    key={item.language}
                    value={item.language}
                    className="h-full overflow-auto"
                  >
                    <CodeBlockContent
                      language={item.language as BundledLanguage}
                    >
                      {item.code}
                    </CodeBlockContent>
                  </CodeBlockItem>
                )}
              </CodeBlockBody>
            </CodeBlock>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
