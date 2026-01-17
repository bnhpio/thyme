import { useMutation, useQuery } from 'convex/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ChainRpcSettingsProps {
  organizationId: Id<'organizations'>;
}

export function ChainRpcSettings({ organizationId }: ChainRpcSettingsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [chainId, setChainId] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');

  const rpcs = useQuery(
    api.query.organizationChainRpc.getOrganizationChainRpcs,
    {
      organizationId,
    },
  );

  const addRpc = useMutation(
    api.mutation.organizationChainRpc.addOrganizationChainRpc,
  );
  const deleteRpc = useMutation(
    api.mutation.organizationChainRpc.deleteOrganizationChainRpc,
  );

  const handleAddRpc = async () => {
    try {
      await addRpc({
        organizationId,
        chainId: Number.parseInt(chainId, 10),
        rpcUrl,
      });
      setIsAddDialogOpen(false);
      setChainId('');
      setRpcUrl('');
    } catch (error) {
      console.error('Failed to add RPC:', error);
      alert(error instanceof Error ? error.message : 'Failed to add RPC');
    }
  };

  const handleDeleteRpc = async (rpcId: Id<'organizationChainRpcs'>) => {
    if (!confirm('Are you sure you want to delete this RPC configuration?')) {
      return;
    }

    try {
      await deleteRpc({ rpcId });
    } catch (error) {
      console.error('Failed to delete RPC:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete RPC');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chain RPC URLs</CardTitle>
              <CardDescription>
                Manage custom RPC URLs for different blockchain networks
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add RPC
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom RPC URL</DialogTitle>
                  <DialogDescription>
                    Add a custom RPC URL for a specific blockchain network
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chainId">Chain ID</Label>
                    <Input
                      id="chainId"
                      type="number"
                      placeholder="1 (for Ethereum Mainnet)"
                      value={chainId}
                      onChange={(e) => setChainId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Standard chain ID (e.g., 1 for Ethereum, 137 for Polygon)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rpcUrl">RPC URL</Label>
                    <Input
                      id="rpcUrl"
                      type="url"
                      placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
                      value={rpcUrl}
                      onChange={(e) => setRpcUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your custom RPC endpoint URL
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRpc} disabled={!chainId || !rpcUrl}>
                    Add RPC
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!rpcs || rpcs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No custom RPC URLs configured</p>
              <p className="text-sm mt-2">
                Add custom RPC URLs to use your own blockchain endpoints
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain ID</TableHead>
                  <TableHead>RPC URL</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rpcs.map((rpc) => (
                  <TableRow key={rpc._id}>
                    <TableCell className="font-mono">{rpc.chainId}</TableCell>
                    <TableCell className="font-mono text-sm truncate max-w-md">
                      {rpc.rpcUrl}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(rpc.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRpc(rpc._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Custom RPC URLs override the default RPC endpoints for specific
            chains
          </p>
          <p>• When creating a profile, you can select which chain to use</p>
          <p>
            • Tasks will use your custom RPC URL when executing on that chain
          </p>
          <p>
            • If no custom RPC is configured, the default chain RPC will be used
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
