import Link from "next/link"
import { Card } from "./ui/card"
import Image from "next/image"
import { Badge } from "./ui/badge"

const ListView = ({ manga, saveLocation }) => {
	return (
		<div className="space-y-4">
			{manga.map((manga) => (
				<Link key={manga.ID} href={`/manga/${manga.ID}`} onClick={saveLocation}>
					<Card className="hover:ring-2 hover:ring-primary hover:scale-[1.02] overflow-hidden transition-all hover:bg-muted/50 my-4">
						<div className="flex px-5">
							<div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
								<Image
									src={manga.Cover || "/placeholder.svg"}
									alt={manga.Name}
									fill={true}
									style={{ objectFit: "cover", objectPosition: "center" }}
									className="object-cover transition-transform group-hover:scale-105"
									priority={true}
								/>
							</div>
							<div className="ml-4 flex flex-1 flex-col justify-between">
								<div>
									<h3 className="font-medium">{manga.Name}</h3>
									<div className="my-3 flex flex-wrap gap-1">
										{manga.Genre?.slice(0, 15).map((genre) => (
											<Badge key={genre} variant="secondary" className="text-xs bg-sky-800">
												{genre}
											</Badge>
										))}
										{manga.Genre.length > 15 && (
											<Badge variant="secondary" className="text-xs bg-sky-800">
												+{manga.Genre.length - 15}
											</Badge>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">{manga.TotalChapters} chapters</p>
								</div>
							</div>
						</div>
					</Card>
				</Link>
			))}
		</div>
	)
}

export default ListView