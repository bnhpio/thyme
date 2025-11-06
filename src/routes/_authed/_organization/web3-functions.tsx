import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/_organization/web3-functions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/_organization/web3-functions"!</div>
}
