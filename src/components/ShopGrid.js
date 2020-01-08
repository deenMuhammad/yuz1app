import React from 'react'
import theme from '../theme'
import t from '../locale/locale'
import { observer } from 'mobx-react'
import { StyleSheet, Image, TouchableOpacity, Dimensions, View, Text } from 'react-native'

export default props => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={styles.cont}
    onPress={() => props.navigate('SingleShop', { ...props })}
  >
    <ShopHeader {...props} />
    <View style={styles.imgCont}>
      {['s', 's', 'l', 'm'].map((item, index) => (
        <ImgButton key={props.Shop._id + index} style={styles[item]} source={props.showcase[index] || ''} />
      ))}
    </View>
  </TouchableOpacity>
)

export const ShopHeader = observer(props => (
  <View style={[styles.header, props.shadow && styles.headerWithShadow, props.style]}>
    <Image style={props.shadow ? styles.logoS : styles.logo} resizeMode='cover' source={{ uri: props.Shop.logo }} />
    <View style={props.shadow ? styles.txtContS : styles.txtCont}>
      <Text style={styles.txt1}>{props.Shop.name}</Text>
      <Text style={styles.txt2}>
        {`${t(props.Shop.address.region)}, ${t(props.Shop.address.district)}, ${props.Shop.address.other}`}
      </Text>
    </View>
  </View>
))

const ImgButton = props => (
  <View style={props.style}>
    <Image
      style={styles.img}
      source={{ uri: props.source }}
      defaultSource={require('../assets/placeholder.png')}
    />
  </View>
)

const radius = 10
const shadow = {
  elevation: 2,
  shadowRadius: 6,
  shadowOpacity: 0.5,
  shadowColor: '#aaa',
  borderRadius: radius,
  shadowOffset: { width: 0, height: 5 },
}
const dw = Dimensions.get('window').width

const styles = StyleSheet.create({
  cont: {
    ...shadow,
    width: dw * 0.96,
    marginTop: dw * 0.02,
    marginLeft: dw * 0.02,
    marginBottom: dw * 0.05,
    backgroundColor: theme.palette.c.w,
  },
  imgCont: {
    flexWrap: 'wrap',
    overflow: 'hidden',
    flexDirection: 'row',
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
  },
  header: { flexDirection: 'row' },
  l: { width: dw * 0.48, height: dw * 0.48 },
  s: { width: dw * 0.24, height: dw * 0.24 },
  m: { width: dw * 0.48, height: dw * 0.24, marginTop: -dw * 0.24 },
  txtCont: { width: dw * 0.7, height: dw * 0.28, justifyContent: 'center' },
  txtContS: { width: dw * 0.8, height: dw * 0.2, justifyContent: 'center' },
  headerWithShadow: { marginTop: -dw * 0.03, backgroundColor: theme.palette.c.w },
  logo: { width: dw * 0.2, height: dw * 0.2, borderRadius: dw * 0.1, margin: dw * 0.04 },
  logoS: { width: dw * 0.14, height: dw * 0.14, borderRadius: dw * 0.07, margin: dw * 0.03 },
  txt1: { fontSize: 18, fontWeight: '700', color: theme.palette.p.d, paddingRight: 10 },
  txt2: { fontSize: 12, fontWeight: '400', color: theme.palette.c.g, paddingRight: 10 },
  img: { width: '100%', height: '100%', borderColor: theme.setOpacity(theme.palette.c.b, 0.15), borderWidth: 0.5 },
})