import Link from "next/link"

const dashboardPage = () => {
  return (
    <div className="flex gap-5">
        <Link className="bg-green-500 text-black p-3" href={'create'}>Create Pending Item</Link>
        <Link className="bg-green-500 text-black p-3" href={'pendingItems'}>Pending Items</Link>
        <Link className="bg-green-500 text-black p-3" href={'items'}>items</Link>
    </div>
  )
}

export default dashboardPage