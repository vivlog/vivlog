import { HomeScreen } from 'app/features/home/screen'
import Head from 'next/head'

import TopMenu from 'app/features/home/top-menu'
import StickyHeader from 'components/StickyHeader'

export default function Page() {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <StickyHeader>
        <TopMenu></TopMenu>
      </StickyHeader>
      <HomeScreen />
    </>
  )
}
