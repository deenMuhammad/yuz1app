import deepFind from 'deep-find'
import gql from 'graphql-tag'
import { observer } from 'mobx-react'
import React from 'react'
import { withApollo } from 'react-apollo'
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Alert from '../components/Alert'
import Overlay from '../components/Overlay'
import Spinner from '../components/Spinner'
import t from '../locale/locale'
import theme from '../theme'

const GET_CATEGORIES_QUERY = gql`query getCategory {getCategory}`

export default observer(withApollo(class Categories extends React.Component {
  n = 1
  state = {
    back: '',
    category: [],
    allCategories: [],
    title: 'allCategories',
    path: ['allCategories'],
    pos: new Animated.Value(0),
    opacity: new Animated.Value(1),
    isSale: false,
  }

  componentDidMount = () => {
    this.getCategories()
  }

  getCategories = () => {
    this.props.client.query({ query: GET_CATEGORIES_QUERY })
      .then(res => {
        const categ = JSON.parse(res.data.getCategory)
        delete categ._id
        delete categ.__v
        this.setState({ category: categ, allCategories: categ })
        const title = this.props.navigation.getParam('title', 'undefined')
        const isSale = this.props.navigation.getParam('isSale', false)
        this.setState({isSale: isSale})
        if(typeof title !== 'undefined') this.onCategoryPress(title)
      })
      .catch(err => Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')))
  }

  animateForward = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(this.state.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(this.state.pos, { toValue: -dw * 0.7, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(this.state.pos, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(this.state.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
  }

  animateBackward = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(this.state.pos, { toValue: dw * 0.7, duration: 300, useNativeDriver: true }),
        Animated.timing(this.state.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.timing(this.state.pos, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(this.state.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
  }

  onCategoryPress = title => {
    if (typeof this.state.category[title] === 'object') {
      this.n = 1
      this.animateForward()
      setTimeout(() => this.setState({
        title: title,
        back: this.state.title,
        path: [...this.state.path, title],
        category: this.state.category[title],
      }), 200)
    } else {
      if(this.state.isSale) {
        this.props.navigation.navigate('SaleCategory', {
          id: this.state.category[title],
        })
      } else {
        this.props.navigation.navigate('CategoryProducts', {
          title: t(title),
          category: this.state.category[title],
        })
      }
    }
  }

  onPrevPress = () => {
    if (this.state.path.length > 1) {
      this.n = 1
      this.animateBackward()
      setTimeout(() => this.setState({
        title: this.state.back,
        back: this.state.path[this.state.path.length - 3],
        path: this.state.path.slice(0, this.state.path.length - 1),
        category: deepFind(this.state.allCategories, this.state.path.slice(1, -1)),
      }), 100)
    }
  }

  render() {
    return (
      <View style={styles.cont}>
        {
          !this.state.isSale && <Overlay />
        }
        {this.state.category.length === 0 ? <Spinner fill /> : (
          <View style={{ flex: 1 }}>
            <Animated.View
              style={[styles.navCont, { opacity: this.state.opacity, transform: [{ translateX: this.state.pos }] }]}
            >
              <TouchableOpacity onPress={this.onPrevPress} style={styles.backBtn}>
                {!(t(this.state.back) === '.' || t(this.state.back) === '.undefined') && (
                  <Icon name='arrow-left' style={styles.backBtnIcon} />
                )}
                <Text style={styles.backBtnText}>
                  {(t(this.state.back) === '.' || t(this.state.back) === '.undefined') ? '' : t(this.state.back)}
                </Text>
              </TouchableOpacity>
              <Text style={styles.navTitle}>↓ {t(this.state.title)}</Text>
            </Animated.View>
            <Animated.ScrollView contentContainerStyle={styles.categCont} style={{ opacity: this.state.opacity }}>
              {Object.keys(this.state.category).map(title => {
                if (this.n === 1) {
                  this.n++
                  return <Categ isSale={this.state.isSale} onPress={() => this.onCategoryPress(title)} key={title} title={title} />
                } else if (this.n === 4) {
                  this.n = 1
                  return <Categ isSale={this.state.isSale} onPress={() => this.onCategoryPress(title)} key={title} title={title} />
                } else {
                  this.n++
                  return <Categ isSale={this.state.isSale} onPress={() => this.onCategoryPress(title)} key={title} title={title} long />
                }
              })}
            </Animated.ScrollView>
          </View>
        )}
      </View>
    )
  }
}))

const Categ = props => props.isSale == false ?(
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={props.onPress}
    style={[styles.categ, props.long ? { width: '52%' } : { width: '36%' }]}
  >
    <Image
      resizeMode='cover'
      style={styles.categImg}
      defaultSource={require('../assets/placeholder.png')}
      source={{ uri: `https://teliera-public.herokuapp.com/static/categories/${props.title}.png` }}
    />
    <Text style={styles.categText}>{t(props.title)}</Text>
  </TouchableOpacity>
):(
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={props.onPress}
    style={[styles.categ, styles.categRow ]}
  >
    <Image
      resizeMode='cover'
      style={styles.categImg2}
      defaultSource={require('../assets/placeholder.png')}
        source={{ uri: `https://teliera-public.herokuapp.com/static/categories/${props.title}.png` }}
    />
    <Text style={[styles.categText, { marginTop: 'auto', marginBottom: 'auto' }]}>{t(props.title)}</Text>
  </TouchableOpacity>
)

const dw = Dimensions.get('window').width

const styles = StyleSheet.create({
  navCont: {
    width: dw * 0.9,
    flexWrap: 'wrap',
    marginLeft: dw * 0.05,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categCont: {
    flexGrow: 1,
    width: '100%',
    marginTop: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingBottom: dw * 0.31,
    justifyContent: 'center',
  },
  categ: {
    alignContent: 'center',
    margin: '1%',
    height: dw * 0.3,
    shadowRadius: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    shadowOpacity: 0.3,
    shadowColor: '#ccc',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: theme.palette.c.w,
    shadowOffset: { width: 0, height: 5 },
    borderColor: theme.setOpacity(theme.palette.c.b, 0.15),
  },
  categRow: { 
    width: '100%', 
    flexDirection: 'row', 
    borderWidth: 0, 
    alignContent: 'flex-start',
    height: dw * 0.1 + 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 30,
    margin: 0,
    paddingBottom: '1%',
    paddingTop: '1%'
  },
  cont: { flex: 1 },
  categImg: { width: dw * 0.1, height: dw * 0.1, marginBottom: 4 },
  categImg2: { width: dw * 0.1, height: dw * 0.1, marginBottom: 4, marginTop: 4, marginRight: 30 },
  backBtnIcon: { color: theme.palette.p.l, marginRight: 5, fontSize: 12 },
  navTitle: { fontSize: 20, fontWeight: '600', color: theme.palette.c.g },
  backBtnText: { fontSize: 12, fontWeight: '300', color: theme.palette.p.l },
  backBtn: { paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
  categText: { fontSize: 12, fontWeight: '600', color: theme.palette.c.g, textAlign: 'center' },
})
