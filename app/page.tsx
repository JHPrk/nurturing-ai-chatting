import ChatLayout from '@components/ChatLayout'
import { AuthGate } from '@components/AuthGate'

export default function Home() {
  return (
    <AuthGate>
      <ChatLayout />
    </AuthGate>
  )
}
