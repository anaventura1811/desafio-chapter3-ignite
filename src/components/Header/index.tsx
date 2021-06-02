import Link from 'next/link';

export default function Header(): JSX.Element {
  return (
    <header>
      <Link href="/">
        <img src="images/logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
