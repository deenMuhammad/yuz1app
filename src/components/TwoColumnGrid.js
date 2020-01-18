import React from 'react';
import t from '../locale/locale';
import Spinner from './Spinner';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  View,
  FlatList,
  Text,
} from 'react-native';
import {numberWithCommas} from './../utils/scaling';
import styled from 'styled-components';
//import FastImage from 'react-native-fast-image'

const layouts = [
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
  {size: 'sp', sp: ''},
];

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
  const w = dw * 0.98;
  //props.data.map((_, i) => { if (i % 8 === 0) images = [...images, props.data.slice(i, i + 8)] })
  const computedStyles = {
    sp: {
      width: props.bordered ? w / 2 : w / 2 - w * 0.02,
      height: w / 2 - w * 0.02 + 50,
      // margin: w * 0.01,
      backgroundColor: '#fff',
      // borderRadius: 5,
      overflow: 'hidden',
    },
    m: {
      width: props.bordered ? w / 2 - 5 : w / 2 - w * 0.01 - 5,
      height: w / 2 - w * 0.02 + 70,
      margin: w * 0.01,
      backgroundColor: '#fff',
      borderRadius: 5,
      overflow: 'hidden',
    },
    s: {
      width: props.bordered ? w / 2 - 5 : w / 2 - w * 0.01 - 5,
      height: w / 2 - w * 0.02 + 90,
      margin: w * 0.01,
      backgroundColor: '#fff',
      borderRadius: 5,
      overflow: 'hidden',
    },
    l: {
      width: props.bordered ? w / 2 - 5 : w / 2 - w * 0.01 - 5,
      height: w / 2 - w * 0.02 + 100,
      margin: w * 0.01,
      backgroundColor: '#fff',
      borderRadius: 5,
      overflow: 'hidden',
    },
  };

  return (
    <FlatList
      style={{paddingHorizontal: '2%'}}
      {...props}
      data={props.data}
      extraData={props.data}
      numColumns={2}
      initialNumToRender={8}
      ListHeaderComponent={props.header}
      contentContainerStyle={[styles.cont, props.style]}
      keyExtractor={(item, index) => item._id}
      // refreshControl={<RefreshControl {...props} />}
      //onMomentumScrollEnd={({ nativeEvent }) => detectBottom(nativeEvent) && props.loadMore()}
      renderItem={({item, index}) => {
        return (
          <ImgButton
            key={item._id}
            source={item.images[0]}
            title={item.name}
            price={item.discount > 0 ? item.price - item.discount : item.price}
            discount={item.discount > 0 ? item.discount : 0}
            loves={item.loves ? item.loves : 0}
            index={index}
            style={[
              computedStyles['sp'],
              props.bordered && {margin: 0.5, borderRadius: 0},
            ]}
            onPress={() => props.push('SingleProduct', {id: item._id})}
            {...props}
          />
        );
      }}
      disableVirtualization
      ListFooterComponent={() => {
        return props.loading ? (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        ) : null;
      }}
      //removeClippedSubviews
    />
  );
};

const ImgButton = props => {
  return (
    <View
      style={[
        styles.imgButtonView,
        {marginLeft: props.index % 2 == 0 ? 0 : '2%'},
      ]}
      key={props.key}>
      <TouchableOpacity
        onPress={props.onPress}
        style={
          ([props.style],
          {
            width: '100%',
            height: 230,
            overflow: 'hidden',
          })
        }
        activeOpacity={0.7}>
        <Image
          style={styles.img}
          source={{uri: props.source}}
          defaultSource={require('../assets/placeholder.png')}
        />

        <Text
          style={[
            styles.title,
            props.bordered ? {width: w / 2 - 5} : {width: w / 2 - w * 0.02 - 5},
          ]}
          numberOfLines={1}>
          {props.title}
        </Text>
        {props.discount > 0 && (
          <Text style={styles.discount}>
            {props.discount} {t('sum')}
          </Text>
        )}
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.price}>
            {numberWithCommas(props.price)} {t('sum')}
          </Text>
        </View>
        <View style={{position: 'absolute', right: 10, bottom: 0}}>
            <Text style={{marginLeft: 'auto', fontSize: 10}}>
            ❤️ {props.loves}
            </Text>
          </View>
      </TouchableOpacity>
    </View>
  );
};

const w = dw * 0.98;

const styles = StyleSheet.create({
  imgButtonView: {
    width: '49%',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: 'rgba(1,1,1,0.1)',
    overflow: 'hidden',
    marginBottom: 15,
    paddingBottom: 10,
    padding: 0,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 5,
  },
  cont: {
    paddingTop: dw * 0.01,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  grid: {
    marginHorizontal: dw * 0.01,
    flexDirection: 'row',
    backgroundColor: 'rgb(245,245,245)',
  },
  img: {
    width: dw * 0.45,
    height: w / 2 - w * 0.02 - 5,
    //borderWidth: 0.5,
    //borderRadius: 10,
    //borderColor: theme.setOpacity(theme.palette.c.b, 0.15),
  },
  bordered_img: {
    width: w / 2 - 5,
    height: w / 2 - 5,
  },
  discount: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '400',
    paddingHorizontal: 10,
    textDecorationLine: 'line-through',
  },
  title: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    width: '100%',
    padding: 10,
    paddingBottom: 0,
    marginTop: 'auto',
  },
  price: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
});

const SpinnerWrapper = styled.View`
  width: 100%;
  height: ${50};
  align-items: center;
  justify-content: center;
`;
