import type {
  MasonryFlashList as SPMasonryFlashList,
  MasonryFlashListProps,
} from '@shopify/flash-list'
import React, { useCallback } from 'react'
import Animated from 'react-native-reanimated'

import {
  useAfterMountEffect,
  useChainCallback,
  useCollapsibleStyle,
  useConvertAnimatedToValue,
  useScrollHandlerY,
  useSharedAnimatedRef,
  useTabNameContext,
  useTabsContext,
  useUpdateScrollViewContentSize,
} from './hooks'

/**
 * Used as a memo to prevent rerendering too often when the context changes.
 * See: https://github.com/facebook/react/issues/15156#issuecomment-474590693
 */

type MasonryFlashListMemoProps = React.PropsWithChildren<
  MasonryFlashListProps<unknown>
>
type MasonryFlashListMemoRef = SPMasonryFlashList<any>

let AnimatedMasonryFlashList: React.ComponentClass<
  MasonryFlashListProps<any>
> | null = null

const ensureFlastList = () => {
  if (AnimatedMasonryFlashList) {
    return
  }

  try {
    const flashListModule = require('@shopify/flash-list')
    AnimatedMasonryFlashList = (Animated.createAnimatedComponent(
      flashListModule.MasonryFlashList
    ) as unknown) as React.ComponentClass<MasonryFlashListProps<any>>
  } catch (error) {
    console.error(
      'The optional dependency @shopify/flash-list is not installed. Please install it to use the MasonryFlashList component.'
    )
  }
}

const MasonryFlashListMemo = React.memo(
  React.forwardRef<MasonryFlashListMemoRef, MasonryFlashListMemoProps>(
    (props, passRef) => {
      ensureFlastList()
      return AnimatedMasonryFlashList ? (
        <AnimatedMasonryFlashList ref={passRef} {...props} />
      ) : (
        <></>
      )
    }
  )
)

function MasonryFlashListImpl<R>(
  {
    style,
    onContentSizeChange,
    refreshControl,
    contentContainerStyle: _contentContainerStyle,
    ...rest
  }: Omit<MasonryFlashListProps<R>, 'onScroll'>,
  passRef: React.Ref<SPMasonryFlashList<any>>
) {
  const name = useTabNameContext()
  const { setRef, contentInset } = useTabsContext()
  const ref = useSharedAnimatedRef<any>(passRef)
  const recyclerRef = useSharedAnimatedRef<any>(null)

  const { scrollHandler, enable } = useScrollHandlerY(name)

  const onLayout = useAfterMountEffect(rest.onLayout, () => {
    'worklet'
    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    enable(true)
  })

  const { progressViewOffset, contentContainerStyle } = useCollapsibleStyle()

  React.useEffect(() => {
    setRef(name, recyclerRef)
  }, [name, recyclerRef, setRef])

  const scrollContentSizeChange = useUpdateScrollViewContentSize({
    name,
  })

  const scrollContentSizeChangeHandlers = useChainCallback(
    React.useMemo(() => [scrollContentSizeChange, onContentSizeChange], [
      onContentSizeChange,
      scrollContentSizeChange,
    ])
  )

  const memoRefreshControl = React.useMemo(
    () =>
      refreshControl &&
      React.cloneElement(refreshControl, {
        progressViewOffset,
        ...refreshControl.props,
      }),
    [progressViewOffset, refreshControl]
  )

  const contentInsetValue = useConvertAnimatedToValue<number>(contentInset)

  const memoContentInset = React.useMemo(() => ({ top: contentInsetValue }), [
    contentInsetValue,
  ])

  const memoContentOffset = React.useMemo(
    () => ({ x: 0, y: -contentInsetValue }),
    [contentInsetValue]
  )

  const memoContentContainerStyle = React.useMemo(
    () => ({
      paddingTop: contentContainerStyle.paddingTop,
      ..._contentContainerStyle,
    }),
    [_contentContainerStyle, contentContainerStyle.paddingTop]
  )

  const refWorkaround = useCallback(
    (value: MasonryFlashListMemoRef | null): void => {
      // https://github.com/Shopify/flash-list/blob/2d31530ed447a314ec5429754c7ce88dad8fd087/src/FlashList.tsx#L829
      // We are not accessing the right element or view of the Flashlist (recyclerlistview). So we need to give
      // this ref the access to it
      // eslint-ignore
      ;(recyclerRef as any)(value?.recyclerlistview_unsafe)
      ;(ref as any)(value)
    },
    [recyclerRef, ref]
  )

  return (
    // @ts-expect-error typescript complains about `unknown` in the memo, it should be T
    <MasonryFlashListMemo
      {...rest}
      onLayout={onLayout}
      ref={refWorkaround}
      contentContainerStyle={memoContentContainerStyle}
      bouncesZoom={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentInset={memoContentInset}
      contentOffset={memoContentOffset}
      refreshControl={memoRefreshControl}
      progressViewOffset={progressViewOffset}
      automaticallyAdjustContentInsets={false}
      onContentSizeChange={scrollContentSizeChangeHandlers}
    />
  )
}

/**
 * Use like a regular MasonryFlashList.
 */
export const MasonryFlashList = React.forwardRef(MasonryFlashListImpl) as <T>(
  p: MasonryFlashListProps<T> & { ref?: React.Ref<SPMasonryFlashList<T>> }
) => React.ReactElement
