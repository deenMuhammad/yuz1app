import {createAppContainer} from 'react-navigation';
import {createDrawerNavigator, DrawerItems} from 'react-navigation-drawer';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import {createStackNavigator} from 'react-navigation-stack';
import React from 'react';
import User from './User';
import theme from './theme';
import Hot from './screens/Hot';
import t from './locale/locale';
import Sale from './screens/Sale';
import Cart from './screens/Cart';
import Shops from './screens/Shops';
import Bonus from './screens/Bonus';
import Liked from './screens/Liked';
import {observer} from 'mobx-react';
import Search from './screens/Search';
import Profile from './screens/Profile';
import AboutUs from './screens/AboutUs';
import Privacy from './screens/Privacy';
import Language from './screens/Language';
import Octagon from './components/Octagon';
import SingleShop from './screens/SingleShop';
import Categories from './screens/Categories';
import EditAccount from './screens/EditAccount';
import SingleOrder from './screens/SingleOrder';
import {togglePopup} from './components/Popup';
import OrderHistory from './screens/OrderHistory';
import OrderDetails from './screens/OrderDetails';
import SingleProduct from './screens/SingleProduct';
import SaleCategory from './screens/SaleCategory';
import CategoryProducts from './screens/CategoryProducts';
import LinearGradient from 'react-native-linear-gradient';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  View,
  ScrollView,
  Text,
  TouchableNativeFeedback,
  Platform,
  SafeAreaView,
  Linking,
} from 'react-native';
import {normalize} from './utils/scaling';

const dw = Dimensions.get('window').width;

const header = {
  headerStyle: {
    height: normalize(52) + (Platform.OS == 'ios' ? getStatusBarHeight() : 0),
    shadowColor: 'transparent',
    elevation: 0,
  },
  headerTitleContainerStyle: {
    width: dw - normalize(120),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  headerTitleStyle: {
    fontSize: normalize(16),
    lineHeight: normalize(24),
    letterSpacing: -0.48,
    color: '#191919',
    textAlign: 'center',
  },
  headerTitleAlign: 'center',
};

const Tab = createMaterialTopTabNavigator(
  {
    Hot: {
      screen: Hot,
      navigationOptions: {
        tabBarLabel: props => <TabBarLabel {...props} title="hot" />,
        tabBarIcon: props => <TabBarIcon name="fire-alt" {...props} />,
      },
    },
    Sale: {
      screen: Sale,
      navigationOptions: {
        tabBarLabel: props => <TabBarLabel {...props} title="sale" />,
        tabBarIcon: props => <TabBarIcon name="percentage" {...props} />,
      },
    },
    Shops: {
      screen: Shops,
      navigationOptions: {
        tabBarLabel: props => <TabBarLabel {...props} title="shops" />,
        tabBarIcon: props => <TabBarIcon name="store-alt" {...props} />,
      },
    },
  },
  {
    lazy: true,
    swipeEnabled: true,
    optimizationsEnable: true,
    tabBarOptions: {
      showIcon: true,
      tabStyle: {flexDirection: 'column'},
      activeTintColor: theme.palette.c.w,
      inactiveTintColor: theme.palette.c.w2,
      inactiveBackgroundColor: theme.palette.c.w,
      indicatorStyle: {
        backgroundColor: theme.palette.c.w,
        width: '15%',
        left: '9%',
      },
      style: {
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: 'transparent',
        marginBottom: 5,
      },
    },
  },
);

const TabBarLabel = observer(props => (
  <Text style={[{color: props.tintColor}, styles.tabBarLabel]}>
    {t(props.title).toUpperCase()}
  </Text>
));

const TabBarIcon = props => (
  <Icon5
    style={[{color: props.tintColor}, styles.tabBarIcon]}
    name={props.name}
  />
);

const Stack = observer(
  createStackNavigator(
    {
      Tab: {
        screen: Tab,
        navigationOptions: ({navigation}) => {
          let activeRoute =
            navigation.state.routes[navigation.state.index].routeName;
          var backColor = '#510273';
          if (activeRoute == 'Hot') var backColor = '#510273';
          else if (activeRoute == 'Sale') var backColor = '#FDC202';
          else var backColor = '#CB201D';

          return {
            // headerTitle: () => <Image source={require('./assets/logo.png')} resizeMode='contain' style={{width: 50, height: 50}}/>,
            headerLeft: () => <MenuButton {...navigation} />,
            headerStyle: {
              borderBottomWidth: 1,
              borderBottomColor: 'transparent',
              elevation: 0,
              marginBottom: 5,
              backgroundColor: backColor,
              shadowColor: 'transparent',
            },
            headerTitle: () => (
              <SearchBar onPress={() => navigation.navigate('Search')} />
            ),
            headerRight: (
              <HeaderRight
                icon="user-tie"
                {...navigation}
                onPress={() =>
                  User.get('token')
                    ? navigation.navigate('Profile')
                    : togglePopup()
                }
              />
            ),
          };
        },
      },
      Profile: {
        screen: Profile,
        navigationOptions: ({navigation}) => ({
          headerTransparent: true,
          headerTintColor: theme.palette.c.w,
          headerTitle: t('profile').toUpperCase(),
          headerStyle: {shadowColor: 'transparent'},
          headerRight: (
            <HeaderRight
              {...navigation}
              icon="sign-out-alt"
              style={{color: '#fff'}}
              onPress={() => User.set(null, null, () => navigation.goBack())}
            />
          ),
        }),
      },
      Cart: {
        screen: Cart,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('cart').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
          headerStyle: {shadowColor: 'transparent'},
        }),
      },
      SingleProduct: {
        screen: SingleProduct,
        navigationOptions: ({navigation}) => ({
          headerTitle: '.....',
          headerRight: <MenuButton {...navigation} />,
          headerStyle: {shadowColor: 'transparent'},
        }),
      },
      SaleCategory: {
        screen: SaleCategory,
        navigationOptions: ({navigation}) => ({
          headerTitle: '.....',
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      Categories: {
        screen: Categories,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('categories').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
          headerStyle: {
            shadowColor: 'transparent'
          }
        }),
      },
      OrderHistory: {
        screen: OrderHistory,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('myOrders').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      SingleOrder: {
        screen: SingleOrder,
        navigationOptions: ({navigation}) => ({
          headerTitle: '.....',
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      EditAccount: {
        screen: EditAccount,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('editAccount').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      Language: {
        screen: Language,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('language').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      SingleShop: {
        screen: SingleShop,
        navigationOptions: ({navigation}) => ({
          headerTitle: '.....',
          headerRight: <MenuButton {...navigation} />,
          headerStyle: {
            shadowColor: 'transparent'
          }
        }),
      },
      Liked: {
        screen: Liked,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('likedItems').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      Search: {
        screen: Search,
        /*navigationOptions: ({ navigation }) => ({
      headerTitle: t('search').toUpperCase(),
      headerRight: <MenuButton {...navigation} />,
    })*/
      },
      Bonus: {
        screen: Bonus,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('bonus').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      Privacy: {
        screen: Privacy,
        navigationOptions: ({navigation}) => ({
          headerTitle: '.....',
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      AboutUs: {
        screen: AboutUs,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('aboutUs').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      OrderDetails: {
        screen: OrderDetails,
        navigationOptions: ({navigation}) => ({
          headerTitle: t('orderDetails').toUpperCase(),
          headerRight: <MenuButton {...navigation} />,
        }),
      },
      CategoryProducts: {
        screen: CategoryProducts,
        navigationOptions: ({navigation}) => ({
          headerRight: <MenuButton {...navigation} />,
        }),
      },
    },
    {
      headerMode: 'screen',
      headerLayoutPreset: 'center',
      //initialRouteName: 'SingleOrder',
      headerTransitionPreset: 'uikit',
      defaultNavigationOptions: ({navigation}) => ({
        headerBackTitle: null,
        headerTruncatedBackTitle: null,
        headerTintColor: theme.palette.p.l,
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '400',
          paddingVertical: 15,
        },
        headerBackImage: ({tintColor, title}) => (
          <HeaderBack color={tintColor} {...navigation} />
        ),
        headerStyle: {
          borderBottomWidth: 1,
          borderBottomColor: 'transparent',
          elevation: 0,
          marginBottom: 20,
        },
      }),
    },
  ),
);

const HeaderBack = observer(props => (
  <TouchableOpacity onPress={() => props.goBack(null)}>
    <Icon5
      name="arrow-left"
      style={[styles.headerBtn /*, { color: props.color }*/]}
    />
  </TouchableOpacity>
));

const MenuButton = observer(props => (
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => props.openDrawer()}
    style={{marginLeft: 30}}>
    <Icon5 name="align-left" style={styles.headerBtn} />
  </TouchableOpacity>
));

const HeaderRight = observer(props => (
  <TouchableOpacity
    onPress={props.onPress}
    activeOpacity={1}
    style={{marginRight: 30}}>
    <Icon5 name={props.icon} style={[styles.headerBtn, props.style]} />
  </TouchableOpacity>
));

const SearchBar = observer(props => (
  <TouchableOpacity
    activeOpacity={1}
    style={styles.searchBarStyle}
    onPress={props.onPress}>
    <Text style={styles.searchBarStylePlaceHolder}>{t('typesmth')}</Text>
  </TouchableOpacity>
));

const Drawer = createDrawerNavigator(
  {
    Stack: {
      screen: Stack,
      navigationOptions: {
        drawerIcon: () => <DrawerIcon name="home" />,
        drawerLabel: props => <DrawerLabel {...props} title="home" />,
      },
    },
    Language: {
      screen: Language,
      navigationOptions: {
        drawerIcon: () => <DrawerIcon name="globe" />,
        drawerLabel: props => <DrawerLabel {...props} title="language" />,
      },
    },
    AboutUs: {
      screen: AboutUs,
      navigationOptions: {
        drawerIcon: () => <DrawerIcon name="info-circle" />,
        drawerLabel: props => <DrawerLabel {...props} title="aboutUs" />,
      },
    },
    Privacy: {
      screen: Privacy,
      navigationOptions: {
        drawerIcon: () => <DrawerIcon name="shield-alt" />,
        drawerLabel: props => <DrawerLabel {...props} title="privacyPolicy" />,
      },
    },
  },
  {
    drawerType: 'back',
    drawerWidth: dw * 0.8,
    useNativeAnimations: true,
    drawerBackgroundColor: theme.palette.c.w,
    contentComponent: props => <DrawerComponent {...props} />,
    contentOptions: {
      iconContainerStyle: {opacity: 1},
      activeTintColor: theme.palette.p.m,
      inactiveTintColor: theme.palette.c.g,
      activeBackgroundColor: 'transparent',
      inactiveBackgroundColor: 'transparent',
      iconContainerStyle: {
        paddingLeft: 30,
        paddingRight: 10,
        paddingVertical: 10,
        opacity: 1,
      },
    },
  },
);

const DrawerLabel = observer(props => (
  <Text style={[{color: props.tintColor}, styles.drawerLabel]}>
    {t(props.title)}
  </Text>
));

const DrawerIcon = props => (
  <Octagon backgroundColor={theme.palette.p.m} size={0.5}>
    <Icon5 name={props.name} style={{fontSize: 16, color: theme.palette.c.w}} />
  </Octagon>
);

const DrawerComponent = observer(props => (
  <View style={{flex: 1}}>
    <ScrollView contentContainerStyle={styles.drawerScroll}>
      <DrawerItems {...props} />
      {Platform.OS === 'android' && Platform.Version >= 21 ? (
        <TouchableNativeFeedback
          onPress={() => Linking.openURL('http://dangasa.uz/business')}
          background={TouchableNativeFeedback.Ripple(
            'rgba(0, 0, 0, .32)',
            false,
          )}>
          <SafeAreaView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              paddingLeft: 20,
            }}>
            <View style={styles.icon}>
              <DrawerIcon name="plus" />
            </View>
            <DrawerLabel {...props} title="business" />
          </SafeAreaView>
        </TouchableNativeFeedback>
      ) : (
        <TouchableOpacity
          onPress={() => Linking.openURL('http://dangasa.uz/business')}>
          <View
            style={[
              styles.row,
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 20
              },
            ]}>
            <View style={styles.icon}>
              <DrawerIcon name="plus" />
            </View>
            <DrawerLabel {...props} title="business" />
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
    <View style={{overflow: 'hidden'}}>
      <LinearGradient
        colors={[theme.palette.p.d, theme.palette.p.l]}
        style={styles.overlay}
      />
      <View style={styles.greetingCont}>
        <Text style={styles.greetingTxtOne}>{t('hello')}</Text>
        <Text style={styles.greetingTxtTwo}>{User.get('username')}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cartCont}
        onPress={() =>
          User.get('token') ? props.navigation.navigate('Cart') : togglePopup()
        }>
        <Octagon android size={6}>
          <Icon5 name="shopping-cart" style={styles.cart} />
        </Octagon>
      </TouchableOpacity>
    </View>
  </View>
));

const styles = StyleSheet.create({
  overlay: {
    width: dw * 0.8,
    height: dw * 0.8,
    marginTop: dw * 0.1,
    marginBottom: -dw * 0.45,
    borderTopLeftRadius: dw * 0.4,
    borderTopStartRadius: dw * 0.4,
    transform: [{rotate: '60deg'}],
    backgroundColor: theme.palette.p.l,
  },
  tabBarIcon: {fontSize: 16},
  tabBarLabel: {fontSize: 10, fontWeight: '100'},
  cart: {fontSize: 30, color: theme.palette.p.m},
  footerIcon: {fontSize: 20, color: theme.palette.p.m},
  footerOctagon: {marginLeft: dw * 0.6, marginBottom: 20},
  drawerScroll: {flexGrow: 1, justifyContent: 'center'},
  greetingTxtOne: {color: theme.palette.c.w, fontSize: 14},
  cartCont: {top: dw * 0.05, left: dw * 0.45, position: 'absolute'},
  drawerLabel: {fontWeight: '400', fontSize: 14, paddingLeft: 10},
  headerBtn: {fontSize: 22, padding: 8, color: 'rgba(0,0,0,0.6)'},
  greetingCont: {position: 'absolute', bottom: dw * 0.05, left: dw * 0.1},
  greetingTxtTwo: {color: theme.palette.c.w, fontSize: 24, fontWeight: '700'},
  searchBarStyle: {
    width: dw - 30,
    height: 44,
    elevation: 3,
    backgroundColor: '#fff',
    borderRadius: 3,
    justifyContent: 'center',
  },
  searchBarStylePlaceHolder: {
    fontSize: 13,
    padding: 5,
    width: '100%',
    textAlign: 'center',
    color: 'rgba(0,0,0,0.6)',
  },
  icon: {
    marginHorizontal: 16,
    width: 24,
    alignItems: 'center',
  },
});

export default createAppContainer(Drawer);
