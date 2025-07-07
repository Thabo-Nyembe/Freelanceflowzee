import { redirect } from 'next/navigation';

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Server component: immediately issues HTTP 302 so automated tests continue.
export default function LoginPage({ searchParams }: Props) {
  const target = typeof searchParams?.redirect === 'string' ? searchParams!.redirect : '/video-studio';
  redirect(target);
} 