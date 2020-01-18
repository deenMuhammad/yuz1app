import React from 'react';
import theme from '../theme';
import gql from 'graphql-tag';
import t from '../locale/locale';
import Alert from '../components/Alert';
import Empty from '../components/Empty';
import {withApollo} from 'react-apollo';
import SliderItem from '../components/SliderItem';
import TwoColumnGrid from '../components/TwoColumnGrid';
import CategoryGrid from '../components/CategoryGrid';
import RefreshControl from '../components/RefreshControl';
import {observer} from 'mobx-react';
import {
  StatusBar,
  View,
  UIManager,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  FlatList,
} from 'react-native';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const POPULAR_PRODUCTS_QUERY = gql`
  query popularProducts($pageSize: Int!, $next: Int!) {
    getPopularProductBatch(pageSize: $pageSize, next: $next) {
      next
      hasMore
      products {
        _id
        images
        price
        name
        loves
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

const GET_CATEGORY = gql`
  query {
    getCategory
  }
`;

const dh = Dimensions.get('window').height;

export default withApollo(
  observer(
    class Hot extends React.Component {
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
          backgroundColor: '#510273',
          marginTop: -5,
        },
      };

      componentDidMount = () => {
        this.getSliderItems();
        this.getCategories();
        this.getProducts();

        this.props.navigation.addListener('willFocus', route => {
          this.setState({isChanged: !this.state.isChanged});
          if (route.state.routeName == 'Hot')
            StatusBar.setBackgroundColor('#510273');
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
                query: POPULAR_PRODUCTS_QUERY,
                variables: {
                  next: this.state.next,
                  pageSize: this.state.pageSize,
                },
              })
              .then(res => {
                // console.log(res)
                if (
                  this.state.next === 1 &&
                  res.data.getPopularProductBatch.products.length === 0
                ) {
                  this.setState({empty: true});
                } else {
                  if (res.data.getPopularProductBatch.next > this.state.next) {
                    this.setState(
                      {
                        loading: false,
                        next: res.data.getPopularProductBatch.next,
                        hasMore: res.data.getPopularProductBatch.hasMore,
                        products: [
                          ...this.state.products,
                          ...res.data.getPopularProductBatch.products,
                        ],
                      },
                      () => LayoutAnimation.easeInEaseOut(),
                    );
                  }
                }
              })
              .catch(err => {
                this.setState({loading: false});
                Alert(
                  t(err.graphQLErrors[0].message) || t('somethingWentWrong'),
                );
              });
        }
        // .catch(err => console.log(err))
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

      //get caregories
      getCategories() {
        this.props.client
          .query({
            query: GET_CATEGORY,
          })
          .then(res => {
            this.setState({
              categories: JSON.parse(res.data.getCategory),
            });
          })
          .catch(err => {
            Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong'));
          });
      }

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
            style={{backgroundColor: '#fff', flexGrow: 1}}
            vertical
            showsVerticalScrollIndicator={false}
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
            <StatusBar backgroundColor="#510273" barStyle="light-content" />
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
                <CategoryGrid
                  data={this.state.categories}
                  {...this.props.navigation}
                />
              </View>
            )}
            <TwoColumnGrid
              loading={this.state.loading&&this.state.products.length>0}
              {...this.props.navigation}
              data={this.state.products}
              bordered={false}
              header={() =>
                !(
                  this.state.products.length === 0 ||
                  this.state.categories.length == 0 ||
                  this.state.sliders.length === 0
                ) && <Text style={styles.popular}>{t('popular')}</Text>
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
    paddingLeft: 10,
    fontSize: 18,
    marginTop: -5,
    fontWeight: '400',
    color: '#000000',
  },
});
