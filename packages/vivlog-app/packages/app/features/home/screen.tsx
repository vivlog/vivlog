import {
  YStack
} from '@my/ui'
import React from 'react'
import { PostBrowsePart } from '../post/browse-screen'

export function HomeScreen() {

  return (
    <YStack f={1} p="$4" space jc="center" ai="center">
      <PostBrowsePart></PostBrowsePart>
    </YStack>
  )
}

// function SheetDemo() {
//   const [open, setOpen] = useState(false)
//   const [position, setPosition] = useState(0)
//   const toast = useToastController()

//   return (
//     <>
//       <Button
//         size="$6"
//         icon={open ? ChevronDown : ChevronUp}
//         circular
//         onPress={() => setOpen((x) => !x)}
//       />
//       <Sheet
//         modal
//         open={open}
//         onOpenChange={setOpen}
//         snapPoints={[80]}
//         position={position}
//         onPositionChange={setPosition}
//         dismissOnSnapToBottom
//       >
//         <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
//         <Sheet.Frame ai="center" jc="center">
//           <Sheet.Handle />
//           <Button
//             size="$6"
//             circular
//             icon={ChevronDown}
//             onPress={() => {
//               setOpen(false)
//               toast.show('Sheet closed!', {
//                 message: 'Just showing how toast works...',
//               })
//             }}
//           />
//         </Sheet.Frame>
//       </Sheet>
//     </>
//   )
// }
