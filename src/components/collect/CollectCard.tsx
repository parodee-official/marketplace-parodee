// // src/components/collect/CollectCard.tsx
// import type { Collectible } from "@/types/collectible";

// type CollectCardProps = {
//   item: Collectible;
//   className?: string;
// };

// export default function CollectCard({ item, className }: CollectCardProps) {
//   return (
//     <div
//       className={`
//         relative flex aspect-square w-full overflow-hidden
//         rounded-[16px] border-[3px] md:border-[4px] border-black bg-white shadow-[5px_5px_0px_rgba(0,0,0,1)]
//         hover:translate-x-1 hover:translate-y-1 hover:shadow-none
//         ${className ?? ""}
//       `}
//     >
//       {item.imageUrl ? (
//         // eslint-disable-next-line @next/next/no-img-element
//         <img
//           src={item.imageUrl}
//           alt={item.name}
//           className="
//             h-full w-full
//             object-cover
//             [image-rendering:pixelated]
//           "
//         />
//       ) : (
//         <div className="flex h-full w-full items-center justify-center bg-black/10">
//           <span className="px-2 text-xs font-semibold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)] md:text-sm">
//             {item.name}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }
