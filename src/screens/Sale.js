import React from 'react';
import theme from '../theme';
import gql from 'graphql-tag';
import t from '../locale/locale';
import Alert from '../components/Alert';
import Empty from '../components/Empty';
import {withApollo} from 'react-apollo';
import SliderItem from '../components/SliderItem';
import TwoColumnGrid from '../components/TwoColumnGrid';
import RefreshControl from '../components/RefreshControl';
import {observer} from 'mobx-react';
import {
  StatusBar,
  View,
  UIManager,
  LayoutAnimation,
  Platform,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const SALE_PRODUCTS_QUERY = gql`
  query getSaleProductBatch($pageSize: Int!, $next: Int!) {
    getSaleProductBatch(pageSize: $pageSize, next: $next) {
      next
      hasMore
      products {
        _id
        images
        name
        price
        discount
      }
    }
  }
`;

const SLIDERS_QUERY = gql`
  query getSliders($pageSize: Int!, $next: Int!) {
    getPromotedProducts(pageSize: $pageSize, next: $next) {
      next
      hasMore
      products {
        _id
        images
        shop
      }
    }
  }
`;

const CATEGORY_QUERY = gql`
  query {
    getSaleCategory
  }
`;

export default withApollo(
  observer(
    class Sale extends React.Component {
      state = {
        loading: false,
        next: 1,
        pageSize: 20,
        products: [],
        hasMore: true,
        empty: false,
        sliders: [],
        categories: [],
        page: 0,
        isChanged: false,
      };

      static navigationOptions = {
        style: {
          backgroundColor: '#FDC202',
          marginTop: -5,
        },
      };

      componentDidMount = () => {
        this.getProducts();
        this.getSliderItems();
        this.getSaleCategory();

        this.props.navigation.addListener('willFocus', route => {
          this.setState({isChanged: !this.state.isChanged});
          if (route.state.routeName == 'Sale')
            StatusBar.setBackgroundColor('#FDC202');
        });
      };

      getProducts = () => {
        if (this.state.loading) {
          return;
        } else {
          this.setState({loading: true});
          this.state.hasMore &&
            this.props.client
              .query({
                fetchPolicy: 'no-cache',
                query: SALE_PRODUCTS_QUERY,
                variables: {
                  next: this.state.next,
                  pageSize: this.state.pageSize,
                },
              })
              .then(res => {
                // console.log(res)
                if (
                  this.state.next === 1 &&
                  res.data.getSaleProductBatch.products.length === 0
                ) {
                  this.setState({empty: true});
                } else {
                  this.setState(
                    {
                      loading: false,
                      next: res.data.getSaleProductBatch.next,
                      hasMore: res.data.getSaleProductBatch.hasMore,
                      products: [
                        ...this.state.products,
                        ...res.data.getSaleProductBatch.products,
                      ],
                    },
                    () => LayoutAnimation.easeInEaseOut(),
                  );
                }
              })
              .catch(err => {
                this.setState({loading: false});
                Alert(
                  t(err.graphQLErrors[0].message) || t('somethingWentWrong'),
                );
              });
        }
      };

      getSaleCategory = () => {
        this.state.hasMore &&
          this.props.client
            .query({
              query: CATEGORY_QUERY,
            })
            .then(res => {
              this.setState({categories: JSON.parse(res.data.getSaleCategory)});
            })
            .catch(err =>
              Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')),
            );
      };

      //get sliders from api
      getSliderItems = () => {
        this.props.client
          .query({
            fetchPolicy: 'no-cache',
            query: SLIDERS_QUERY,
            variables: {next: this.state.next, pageSize: this.state.pageSize},
          })
          .then(res => {
            this.setState({
              sliders: res.data.getPromotedProducts.products.slice(0, 3),
            });
          })
          .catch(err => {
            Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong'));
          });
      };

      detectBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 40;
        return (
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom
        );
      };

      loadMore() {
        this.setState({next: this.state.next + 1});
        this.getProducts();
      }

      sliderScroll = event => {
        var page = parseInt(event.nativeEvent.contentOffset.x / (dw - 10));
        this.setState({page});
      };

      render() {
        return this.state.empty ? (
          <Empty />
        ) : (
          <ScrollView
            style={{backgroundColor: '#fff'}}
            vertical
            showsVerticalScrollIndicator={false}
            style={[
              !(
                this.state.products.length === 0 ||
                this.state.categories.length == 0 ||
                this.state.sliders.length === 0
              )
                ? {backgroundColor: '#fff'}
                : {backgroundColor: '#fff'},
            ]}
            onMomentumScrollEnd={({nativeEvent}) =>
              this.detectBottom(nativeEvent) && this.loadMore()
            }
            refreshControl={
              <RefreshControl
                refreshing={
                  this.state.products.length === 0 ||
                  this.state.categories.length == 0 ||
                  this.state.sliders.length === 0
                }
                onRefresh={() => {
                  this.setState(
                    {next: 1, products: [], hasMore: true},
                    () => Platform.OS !== 'ios' && this.getProducts(),
                  );
                }}
              />
            }>
            <StatusBar backgroundColor="#FDC202" barStyle="light-content" />
            {!(
              this.state.products.length === 0 ||
              this.state.categories.length == 0 ||
              this.state.sliders.length === 0
            ) && (
              <View>
                <Slider
                  page={this.state.page}
                  onScroll={this.sliderScroll}
                  sliders={this.state.sliders}
                  {...this.props.navigation}
                />
                <CategoryView
                  category={this.state.categories}
                  {...this.props}
                />
              </View>
            )}
            <TwoColumnGrid
              loading={this.state.loading&&this.state.products.length>0}
              {...this.props.navigation}
              data={this.state.products}
              header={() =>
                !(
                  this.state.products.length === 0 ||
                  this.state.categories.length == 0 ||
                  this.state.sliders.length === 0
                ) && (
                  <Text style={styles.saleProductHeader}>{t('hotSales')}</Text>
                )
              }
            />
          </ScrollView>
        );
      }
    },
  ),
);

const dw = Dimensions.get('window').width;

//slider view
const Slider = props => {
  return (
    <View>
      <ScrollView
        horizontal
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={event => props.onScroll(event)}
        style={styles.sliderContainer}>
        {props.sliders.length > 0 &&
          props.sliders.map((val, i) => (
            <SliderItem key={val._id} value={val} {...props} />
          ))}
      </ScrollView>
      <ScrollIndicator page={props.page} sliders={props.sliders} />
    </View>
  );
};

const CategoryView = props => (
  <View style={styles.sale_scrollView}>
    <Text style={styles.popular}>{t('salesByCategory')}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sale_scroll}>
      {props.category && getCategoryItem(props.category, props)}
    </ScrollView>
  </View>
);

const getCategoryItem = (data, props) => {
  var items = [];
  var n = 0;
  for (let i in data) {
    items[n] = <CategoryItem key={i} item={data[i]} index={i} {...props} />;
    n++;
  }

  return items;
};

const CategoryItem = props => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.categoryItem}
      onPress={() => {
        props.navigation.push('Categories', {
          title: props.index,
          isSale: true,
        });
      }}>
      <View style={styles.CTImageBox}>
        <Image
          style={styles.CTImage}
          defaultSource={require('../assets/placeholder.png')}
          source={{
            uri: `https://teliera-public.herokuapp.com/static/categories/${props.index}.png`,
          }}
        />
      </View>
      <Text style={styles.CTText}>{t(props.index)}</Text>
    </TouchableOpacity>
  );
};

const ScrollIndicator = props => {
  return (
    <View style={styles.scrollIndicator}>
      {props.sliders.map((val, i) => (
        <View
          style={[
            styles.indicatorDot,
            props.page == i && {backgroundColor: theme.palette.p.m},
          ]}></View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: (dw * 3) / 5,
    paddingTop: 5,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicatorDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.c.w,
    marginLeft: 2,
    marginRight: 2,
  },
  popular: {
    padding: 5,
    paddingTop: 0,
    marginTop: -5,
    paddingLeft: 10,
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
  },
  sale_scrollView: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    width: dw - 10,
    height: dw / 2 + 30,
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 3,
  },
  sale_scroll: {
    width: dw - 10,
    height: dw / 2,
  },
  categoryItem: {
    height: dw / 2,
    width: dw / 3,
    borderRadius: 5,
    marginRight: 5,
  },
  CTImage: {
    height: dw / 3 - 40,
    width: dw / 3 - 40,
    margin: 10,
  },
  CTText: {
    width: dw / 3 - 20,
    marginLeft: 10,
    color: '#000',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  CTImageBox: {
    height: dw / 3 - 20,
    width: dw / 3 - 20,
    margin: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  popular: {
    padding: 5,
    paddingLeft: 10,
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
  },
  saleProductHeader: {
    padding: 5,
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
  },
});
