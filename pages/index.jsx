import Head from "next/head";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Jay Dashboard</title>
      </Head>
      <Dashboard />
    </>
  );
}
