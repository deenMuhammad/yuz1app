import gql from 'graphql-tag'
import { observer } from 'mobx-react'
import React from 'react'
import { withApollo } from 'react-apollo'
import { Dimensions, Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native'
import Communications from 'react-native-communications'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Carousel from '../components/Carousel'
import Octagon from '../components/Octagon'
import { togglePopup } from '../components/Popup'
import Spinner from '../components/Spinner'
import TwoColumnGrid from '../components/TwoColumnGrid'
import t from '../locale/locale'
import theme from '../theme'
import User from '../User'

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

const SINGLE_PRODUCT_QUERY = gql`
query product($id: String!) {
  getProduct(_id: $id) {
    _id hot name price liked images measure category discount
    long_desc short_desc shop {logo phone} stock {_id count size color}
  }
}`

const ADD_TO_CART_QUERY = gql`
mutation addToCart($product_id: String!, $stock: [InputCartItem!]) {
  addToCart(product_id: $product_id, stock: $stock)
}`

const ADD_TO_LIKED_QUERY = gql`
mutation addToLiked($product_id: String!) { addToLiked(product_id: $product_id)}`

const REMOVE_FROM_LIKED_QUERY = gql`
mutation removeFromLiked($product_id: String!) { removeFromLiked(product_id: $product_id)}`

const MATCHING_PRODUCTS_QUERY = gql`
query matchingProducts($id: String!) { getMatchingProductList(current_product_id: $id) {_id, images, price, name}}`

export default observer(withApollo(class SingleProduct extends React.Component {
  state = { product: null, matchingProducts: null, isLiked: false, inCart: false, stock: [], colors: {}, sizes: {}, selectedColor: "", countProduct: 0, selectedSize: "", _id: "", phone: "" }

  componentDidMount() {
    this.getProduct()
    this.getMatchingProducts()
  }

  getProduct = () => {
    this.props.client.query({
      fetchPolicy: 'no-cache',
      query: SINGLE_PRODUCT_QUERY,
      variables: { id: this.props.navigation.state.params.id },
    })
      .then(res => {
        var products = res.data.getProduct.stock
        this.setState({phone: res.data.getProduct.shop.phone})
        var colors = {}
        products.map((item, i) => {
          if (this.state.selectedColor.length == 0) {
            this.setState({ selectedColor: item.color })
          }

          if (this.state.selectedSize.length == 0) {
            this.setState({ selectedSize: item.size })
            this.setState({ countProduct: item.count })
            this.setState({ _id: item._id })
          }

          if (!colors[item.color])
            colors[item.color] = {}
          colors[item.color][item.size] = item
        })
        this.setState({ colors: colors })
        this.setState({ sizes: colors[this.state.selectedColor] })

        this.setState({ product: res.data.getProduct })
      })
      .catch(err => Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')))
  }

  getMatchingProducts = () => {
    this.props.client.query({
      fetchPolicy: 'no-cache',
      query: MATCHING_PRODUCTS_QUERY,
      variables: { id: this.props.navigation.state.params.id }
    })
      .then(res => this.setState({ matchingProducts: res.data.getMatchingProductList }))
      .catch(err => Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')))
  }

  onShare = () => {
    Share.share({ message: `https://https://teliera-public.herokuapp.com/share/${this.state.product._id}` })
      .catch(err => Alert(t('somethingWentWrong')))
  }

  onLike = () => {
    if (User.get('token')) {
      this.props.client.mutate({
        fetchPolicy: 'no-cache',
        variables: { product_id: this.state.product._id },
        mutation: this.state.product.liked ? REMOVE_FROM_LIKED_QUERY : ADD_TO_LIKED_QUERY
      })
        .then(res => {
          let tmp = this.state.product
          tmp.liked = res.data.addToLiked
          this.setState({ product: tmp })
        })
        .catch(err => Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')))
    } else togglePopup()
  }

  addToCart = () => {
    if (!User.get('token')) togglePopup()
    else if (!this.state.stock.some(item => item.count > 0)) Alert(t('chooseProduct'))
    else {
      this.props.client.mutate({
        mutation: ADD_TO_CART_QUERY,
        variables: {
          fetchPolicy: 'no-cache',
          product_id: this.state.product._id,
          stock: this.state.stock.map(item => (
            { item_id: item._id, size: item.size, color: item.color, count: item.count }
          ))
        }
      })
        .then(res => { this.setState({ inCart: res.data.addToCart }) })
        .catch(err => Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')))
    }
  }

  handleStock = option => {
    if (this.state.stock.find(item => item.color === option.color && item.size === option.size)) {
      let newStock = this.state.stock.filter(item => item.color !== option.color && item.size !== option.size)
      newStock = [...newStock, option]
      this.setState({ stock: newStock })
    } else this.setState({ stock: [...this.state.stock, option] })
  }

  onBuy = () => {
    if (!User.get('token')) togglePopup()
    else if (!this.state.stock.some(item => item.count > 0)) Alert(t('chooseProduct'))
    else this.props.navigation.navigate('OrderDetails', {
      single: true,
      order: [{ product_id: this.state.product._id, item: this.state.stock }],
    })
  }

  changeColor = (color) => {
    this.setState({ selectedSize: Object.keys(this.state.colors[color])[0] })
    this.setState({ selectedColor: color })
    this.setState({ sizes: this.state.colors[color] })
  }

  selectSize = (size, item) => {
    this.setState({ selectedSize: size })
    this.setState({ countProduct: item.count })
    this.setState({ _id: item._id })
  }

  render() {
    return (
      <View style={styles.cont}>
        {this.state.product ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Carousel data={this.state.product.images} />
            <Info
              onBuy={this.onBuy}
              {...this.state.product}
              {...this.props.navigation}
              inCart={this.state.inCart}
              onAddToCart={this.addToCart}
              isLiked={this.state.product.liked}
              selectedValue={val => this.handleStock(val)}
              colors={this.state.colors}
              selectedColor={this.state.selectedColor}
              sizes={this.state.sizes}
              changeColor={this.changeColor.bind(this)}
              selectSize={this.selectSize.bind(this)}
              selectedSize={this.state.selectedSize}
              countProduct={this.state.countProduct}
              onLike={this.onLike}
              onShare={this.onShare}
              phone={this.state.phone}
              _id={this.state._id}
            />
            <View style={styles.extra}>
              <Text style={styles.extraTxt}>#{t('matchingProducts')}</Text>
              {this.state.matchingProducts ? (
                <TwoColumnGrid
                  {...this.props.navigation}
                  bordered={true}
                  data={this.state.matchingProducts}
                />
              ) : <Spinner />}
            </View>
          </ScrollView>
        ) : <Spinner full />}
      </View>
    )
  }
}))

const Info = props => (
  <View style={styles.infoCont}>
    <View style={styles.shopLogoCont}>
      <Image source={{ uri: props.shop.logo }} style={styles.shopImage} resizeMode='cover' />
      <Text style={styles.name}>{props.name}</Text>
    </View>
    <View style={styles.row1}>
      <View style={{ flexDirection: 'column' }}>
        <Text style={styles.price2}>{props.price - props.discount} {t('sum')}</Text>
        {props.discount ? <Text style={styles.price1}>{props.price} {t('sum')}</Text> : null}
      </View>

      <View style={[styles.row2, { marginLeft: 'auto', marginRight: 10 }]}>
        <TouchableOpacity onPress={props.onShare}>
          <Octagon size={3} android>
            <Icon name='share' style={styles.octagon} />
          </Octagon>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 20 }} onPress={props.onLike}>
          <Octagon size={3} android>
            {props.liked ? (
              <Icon name='heart-broken' style={styles.octagon} />
            ) : (
                <Icon name='thumbs-up' style={styles.octagon} />
              )}
          </Octagon>
        </TouchableOpacity>
      </View>

    </View>
    <View style={{ marginHorizontal: dw * 0.05, }}>
      <Text style={styles.shortDesc}>{props.short_desc.replace(/  /g, '')}</Text>
    </View>
    <View style={styles.hr}></View>

    <View style={{ paddingHorizontal: dw * 0.05, flexDirection: 'row' }}>
      <Text style={styles.color_text}>{t('color')}: </Text>
      <Text style={styles.color_text_val}>{props.selectedColor}</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 60 }}
      style={{ paddingHorizontal: dw * 0.05, flexDirection: 'row' }}>
      {
        renderColor(props)
      }
    </ScrollView>
    <View style={{ paddingHorizontal: dw * 0.05, flexDirection: 'row', borderTopWidth: 1, borderColor: '#ddd' }}>
      <Text style={styles.color_text}>{t('size')}: </Text>
      <Text style={styles.color_text_val}>{parseInt(props.selectedSize) > 0 ? props.selectedSize : "Not selected"}</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 60 }}
      style={{ paddingHorizontal: dw * 0.05, flexDirection: 'row' }}>
      {
        renderSize(props)
      }
    </ScrollView>
    <View style={[styles.row1, { marginHorizontal: dw * 0.05, }]}>

    </View>
    <View style={styles.hr}></View>

    <View style={{ marginHorizontal: dw * 0.05, }}>
      <Text style={styles.longDesc}>{props.long_desc.replace(/  /g, '')}</Text>
    </View>
    <View style={styles.stockCont}>
      <Stock
        count={props.countProduct}
        measure={props.measure}
        selectedValue={val => props.selectedValue({ _id: props._id, size: parseFloat(props.selectedSize), color: props.selectedColor, count: val })}
      />
    </View>
    <View style={styles.row2}>
      <Button title={t('callToSeller')} style={{ marginRight: 20 }} onPress={() => {
         Communications.phonecall(props.phone, true)
      }} />
      <Button title={t('buy')} style={{ alignSelf: 'flex-end' }} onPress={props.onBuy} />
      {props.inCart ? (
        <Button title={t('goToCart')} text onPress={() => props.push('Cart')} />
      ) : (
          <TouchableOpacity style={{ marginLeft: 20 }} onPress={props.onAddToCart}>
            <Octagon size={3} android>
              <Icon name='cart-plus' style={styles.octagon} />
            </Octagon>
          </TouchableOpacity>
        )}
    </View>
  </View>
)

const renderColor = (props) => {
  var items = []
  var n = 0
  for (let i in props.colors) {
    items[n] = <CircleData key={i} onPress={() => props.changeColor(i)} color={props.selectedColor == i ? 'red' : '#ddd'} title={i} />
    n++
  }
  return items
}

const renderSize = (props) => {
  var items = []
  var n = 0
  for (let i in props.sizes) {
    var val = props.sizes[i]
    items[n] = <CircleData color={props.selectedSize == i ? 'red' : '#ddd'} onPress={() => props.selectSize(i, val)} key={i} title={i} />
    n++
  }
  return items
}

const CircleData = (props) => (
  <TouchableOpacity onPress={props.onPress} style={[styles.circleData, { borderColor: props.color }]}>
    <Text style={styles.circleDataText}>{props.title}</Text>
  </TouchableOpacity>
)

class Stock extends React.Component {
  state = { count: 0 }
  minus = () => this.state.count !== 0 &&
    this.setState({ count: this.state.count - 1 }, () => this.props.selectedValue(this.state.count))
  plus = () => this.state.count < this.props.count &&
    this.setState({ count: this.state.count + 1 }, () => this.props.selectedValue(this.state.count))
  render() {
    const { props, state } = this
    return (
      <View style={styles.stock}>
        <View style={styles.stockManager}>
          <TouchableOpacity activeOpacity={state.count === 0 ? 1 : 0} onPress={this.minus}>
            <Icon style={state.count === 0 ? styles.stockIconD : styles.stockIcon} name='minus-circle' />
          </TouchableOpacity>
          <Text style={styles.stockCounter}>{state.count} {props.measure && t(props.measure)}</Text>
          <TouchableOpacity activeOpacity={state.count === props.count ? 1 : 0} onPress={this.plus}>
            <Icon style={state.count === props.count ? styles.stockIconD : styles.stockIcon} name='plus-circle' />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const dw = Dimensions.get('window').width

const styles = StyleSheet.create({
  stock: {
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    justifyContent: 'space-between',
    borderBottomColor: theme.palette.p.l,
  },
  extra: { marginTop: 20 },
  infoCont: { marginTop: 0 },
  octagon: { fontSize: 20, color: theme.palette.p.m },
  stockManager: { alignItems: 'center', flexDirection: 'row' },
  stockIcon: { padding: 5, fontSize: 20, color: theme.palette.p.l },
  name: { fontSize: 12, fontWeight: '500', color: theme.palette.c.b },
  shopImage: { width: 20, height: 20, marginRight: 6, borderRadius: dw * 0.07 },
  stockCounter: { fontSize: 20, marginHorizontal: 10, color: theme.palette.p.l },
  row2: { marginHorizontal: dw * 0.05, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  price2: { fontSize: 20, fontWeight: '600', color: theme.palette.p.d, opacity: 0.9 },
  row1: { marginHorizontal: dw * 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockText: { fontSize: 16, fontWeight: '200', color: theme.palette.p.d, width: '30%' },
  longDesc: { color: theme.palette.c.g, fontSize: 14, marginTop: 14, fontWeight: '300', paddingBottom: 20 },
  shortDesc: { color: "#000", fontSize: 14, marginTop: 14, fontWeight: '400' },
  stockIconD: { padding: 5, fontSize: 20, color: theme.setOpacity(theme.palette.c.g, 0.6) },
  stockCont: { marginHorizontal: dw * 0.05, marginVertical: 30, borderTopWidth: 0.5, borderTopColor: theme.palette.p.l },
  extraTxt: { marginLeft: dw * 0.03, fontSize: 14, fontWeight: '600', color: theme.palette.p.l },
  shopLogoCont: { marginHorizontal: dw * 0.05, width: dw * 0.5, flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' },
  cont: { flex: 1, backgroundColor: theme.palette.c.w, alignItems: 'center', justifyContent: 'center' },
  price1: { fontSize: 12, fontWeight: '400', color: theme.palette.c.g, textDecorationLine: 'line-through', marginBottom: 'auto', marginTop: 'auto' },
  hr: { height: 0.05 * dw, backgroundColor: '#ddd', width: dw, marginTop: 10 },
  circleData: { marginTop: 10, marginBottom: 10, marginLeft: 5, marginRight: 5, borderRadius: 15, borderWidth: 1, justifyContent: 'center' },
  circleDataText: { lineHeight: 12, color: '#000', padding: 10 },
  color_text: { fontSize: 14, color: 'rgba(0,0,0,0.5)', marginTop: 10 },
  color_text_val: { fontSize: 14, color: 'rgba(0,0,0,1)', marginTop: 10 },
})