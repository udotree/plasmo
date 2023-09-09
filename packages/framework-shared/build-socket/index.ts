import { WebSocket, WebSocketServer } from "ws"

import { BuildSocketEvent } from "./event"

export { BuildSocketEvent }

const createBuildSocket = (hmrHost: string, hmrPort: number) => {
  const wss = new WebSocketServer({
    host: hmrHost,
    port: hmrPort + 1
  })

  const broadcast = (type: BuildSocketEvent) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type }))
      }
    }
  }

  return {
    broadcast
  }
}

let _buildSocket: Awaited<ReturnType<typeof createBuildSocket>>

export const getBuildSocket = (hmrHost = "localhost", hmrPort?: number) => {
  if (process.env.NODE_ENV === "production") {
    return null
  }

  if (!!_buildSocket) {
    return _buildSocket
  }

  if (!hmrPort) {
    throw new Error("HMR port is not provided")
  }

  _buildSocket = createBuildSocket(hmrHost, hmrPort)
  return _buildSocket
}

export const buildBroadcast = (type: BuildSocketEvent) => {
  if (process.env.NODE_ENV === "production") {
    return
  }

  const buildSocket = getBuildSocket()
  if (buildSocket) {
    buildSocket.broadcast(type)
  }
}
