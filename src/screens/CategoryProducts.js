import React from 'react';
import theme from '../theme';
import gql from 'graphql-tag';
import t from '../locale/locale';
import Alert from '../components/Alert';
import Empty from '../components/Empty';
import {withApollo} from 'react-apollo';
import {StatusBar, View} from 'react-native';
import ThreeColumnGrid from '../components/ThreeColumnGrid';

const GET_PRODUCTS_BY_CATEGORY_QUERY = gql`
  query categoryProducts($pageSize: Int!, $next: Int!, $category: Int!) {
    getProductBatchByCategory(
      pageSize: $pageSize
      next: $next
      category: $category
    ) {
      next
      hasMore
      products {
        _id
        images
        name
        price
        discount
        loves
      }
    }
  }
`;

export default withApollo(
  class CategoryProducts extends React.Component {
    static navigationOptions = ({navigation}) => ({
      title: navigation.state.params.title.toUpperCase(),
    });

    state = {next: 1, pageSize: 88, products: [], hasMore: true, empty: false};

    componentDidMount = () => {
      this.getProducts();
    };

    getProducts = () => {
      this.state.hasMore &&
        this.props.client
          .query({
            fetchPolicy: 'no-cache',
            query: GET_PRODUCTS_BY_CATEGORY_QUERY,
            variables: {
              next: this.state.next,
              pageSize: this.state.pageSize,
              category: this.props.navigation.state.params.category,
            },
          })
          .then(res => {
            if (
              this.state.next === 1 &&
              res.data.getProductBatchByCategory.products.length === 0
            ) {
              this.setState({empty: true});
            } else {
              this.setState({
                next: res.data.getProductBatchByCategory.next,
                hasMore: res.data.getProductBatchByCategory.hasMore,
                products: [
                  ...this.state.products,
                  ...res.data.getProductBatchByCategory.products,
                ],
              });
            }
          })
          .catch(err =>
            Alert(t(err.graphQLErrors[0].message) || t('somethingWentWrong')),
          );
    };

    render() {
      return this.state.empty ? (
        <Empty />
      ) : (
        <View style={{flex: 1}}>
          <ThreeColumnGrid
            {...this.props.navigation}
            data={this.state.products}
            loadMore={this.getProducts}
            refreshing={this.state.products.length === 0}
            onRefresh={() =>
              this.setState({next: 1, products: [], hasMore: true})
            }
          />
        </View>
      );
    }
  },
);
