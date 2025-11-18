import { Outlet, createRootRoute } from '@tanstack/react-router'
import { SocketProvider } from '../context/SocketContext'

export const Route = createRootRoute({
  component: () => (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  ),
})
