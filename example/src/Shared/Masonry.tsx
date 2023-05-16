import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import * as Tabs from 'react-native-collapsible-tab-view'
interface MasonryData {
  index: number
  height: number
}
const columnCount = 3
const data: MasonryData[] = new Array(99).fill(null).map((_, index) => {
  return {
    index,
    height: ((index * 10) % 100) + 100 / ((index % columnCount) + 1),
  }
})

const Masonry: React.FC<object> = () => {
  return (
    <Tabs.MasonryFlashList
      testID="MasonryList"
      data={data}
      optimizeItemArrangement
      overrideItemLayout={(layout, item) => {
        layout.size = item.height
      }}
      numColumns={columnCount}
      estimatedItemSize={150}
      ListHeaderComponent={
        <Component
          item={{ index: 0, height: 100 }}
          text="Header"
          backgroundColor="silver"
        />
      }
      ListFooterComponent={
        <Component
          item={{ index: 0, height: 100 }}
          text="Footer"
          backgroundColor="lightblue"
        />
      }
      ListEmptyComponent={
        <Component
          item={{ index: 0, height: 100 }}
          text="Empty"
          backgroundColor="black"
        />
      }
      keyExtractor={(item, index) => {
        if (item.index !== index) {
          console.log('Key Extractor issue @', index)
        }
        return item.index.toString()
      }}
      getItemType={(item, index) => {
        if (item.index !== index) {
          console.log(index)
        }
        return undefined
      }}
      renderItem={({ item }) => {
        return <Component item={item} />
      }}
      getColumnFlex={(_, index) => {
        return index === 1 ? 2 : 1
      }}
      onLoad={({ elapsedTimeInMs }) => {
        console.log('List Load Time', elapsedTimeInMs)
      }}
      contentContainerStyle={styles.contentContainer}
    />
  )
}
const Component = (props: {
  item: MasonryData
  text?: string
  backgroundColor?: string
}) => {
  const itemStyle = [
    styles.item,
    {
      height: props.item.height,
      backgroundColor: props.backgroundColor ?? 'darkgray',
    },
  ]
  return (
    <View style={itemStyle}>
      <Text>{props.text ?? props.item.index}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  contentContainer: {
    paddingHorizontal: 2,
  },
})

export default Masonry
