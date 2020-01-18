import React from 'react';
import t from '../locale/locale';
import RefreshControl from './RefreshControl';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  View,
  FlatList,
  Text,
} from 'react-native';

const dw = Dimensions.get('window').width;

export const detectBottom = ({
  layoutMeasurement,
  contentOffset,
  contentSize,
}) => {
  const paddingToBottom = 40;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

export default props => {
  let images = [];
  props.data.map((_, i) => {
    if (i % 3 === 0) images = [...images, props.data.slice(i, i + 3)];
  });
  return (
    <FlatList
      {...props}
      data={images}
      extraData={images}
      initialNumToRender={8}
      ListHeaderComponent={props.header}
      contentContainerStyle={[styles.cont, props.style]}
      keyExtractor={(item, index) => item[0]._id}
      refreshControl={<RefreshControl {...props} />}
      onMomentumScrollEnd={({nativeEvent}) =>
        detectBottom(nativeEvent) && props.loadMore()
      }
      renderItem={({item}) => {
        return (
          <View style={styles.grid}>
            {item &&
              item.map((val, i) => (
                <SingleItem
                  item={val}
                  key={i}
                  onPress={() => props.push('SingleProduct', {id: val._id})}
                />
              ))}
          </View>
        );
      }}
      disableVirtualization
      removeClippedSubviews
    />
  );
};

const SingleItem = props => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.singleItem}
      onPress={props.onPress}>
      <Image
        style={[styles.img]}
        source={{uri: props.item.images[0]}}
        defaultSource={require('../assets/placeholder.png')}
      />
      <Text style={styles.title}>{props.item.name}</Text>
      <View
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 35,
          height: 35,
          padding: 2,
          borderRadius: 50,
          backgroundColor: 'rgba(255,255,255,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <Text style={{marginLeft: 'auto', fontSize: 10}}>
          ❤️ {props.item.loves}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const w = dw * 0.98;
const sw = (w - 30) / 3;

const styles = StyleSheet.create({
  cont: {paddingTop: dw * 0.01, marginRight: 5},
  grid: {
    marginHorizontal: dw * 0.01,
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
  singleItem: {
    width: sw,
    minHeight: sw + 40,
    backgroundColor: '#fff',
    margin: 5,
  },
  img: {
    width: sw - 10,
    margin: 5,
    height: sw - 10,
    //borderWidth: 0.5,
    //borderRadius: 10,
    //borderColor: theme.setOpacity(theme.palette.c.b, 0.15),
  },
  title: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.8)',
    width: '100%',
    padding: 5,
    textAlign: 'center',
  },
  /*price: { fontSize: 14, color: '#000', fontWeight: '400', paddingLeft: 5, marginBottom: 10 },*/
});
