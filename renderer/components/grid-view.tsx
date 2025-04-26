import Link from "next/link"
import { Card } from "./ui/card"
import Image from "next/image"

const GridView = ({ manga, saveLocation }) => {
	return (
		<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{manga.map((manga, index) => (
				<Link
					key={index}
					href={`/manga/${manga.ID}`}
					className="group flex justify-center"
					prefetch={false}
					onClick={saveLocation}
				>
					<Card className="h-96 w-full max-w-[240px] transform duration-300 overflow-hidden transition-all hover:ring-2 hover:ring-primary p-0 ease-in-out">
						<div className="relative h-full w-full">
							<Image
								src={manga.Cover || "/placeholder.svg"}
								alt={manga.Name}
								fill={true}
								style={{ objectFit: "cover", objectPosition: "center" }}
								className="object-cover transition-transform h-full w-full group-hover:scale-105"
								priority={true}
							/>
							<div className="absolute bottom-0 left-0 w-full min-h-[9vh] flex items-center justify-center p-4 text-center bg-gradient-to-t from-gray-950/90 to-transparent">
								<h3 className="line-clamp-2 text-center font-medium leading-tight text-foreground-2">{manga.Name}</h3>
							</div>
						</div>
					</Card>
				</Link>
			))}
		</div>
	)
}

export default GridView