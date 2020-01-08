import React from 'react'
import User from './User'
import Root from './Router'
import Auth from './screens/Auth'
import {observer} from 'mobx-react'
import Popup from './components/Popup'
import {Dimensions, Image, YellowBox} from 'react-native'
import {ApolloClient} from 'apollo-client'
import {ApolloProvider} from 'react-apollo'
import {setContext} from 'apollo-link-context'
import {createHttpLink} from 'apollo-link-http'
import {AlertContainer} from './components/Alert'
import {InMemoryCache} from 'apollo-cache-inmemory'

YellowBox.ignoreWarnings(['source.uri', 'Task orphaned', 'Remote debugger'])

const httpLink = createHttpLink({ credentials: 'same-origin', uri: `https://teliera-server.herokuapp.com/graphql` })

const authLink = setContext((_, { headers }) => (
  { headers: { ...headers, authorization: User.get('token') ? `${User.get('token')}` : '' } }
))

const client = new ApolloClient({ link: authLink.concat(httpLink), cache: new InMemoryCache() })

class App extends React.Component {
  state = { splash: true }

  timer = null
  componentDidMount = () => {
    this.timer = setTimeout(() => {
      //SplashScreen.hide()
      this.setState({ splash: false })
    }, 3000)
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  render() {
    const dw = Dimensions.get('window').width

    if (this.state.splash) {
      return (
        <Image source={require('./assets/launch_screen.png')} style={{ width: 1, height: 1 }} />
      )
    } else {
      return (
        <ApolloProvider client={client}>
          <Popup content={<Auth />}>
            <Root />
          </Popup>
          <AlertContainer />
        </ApolloProvider>
      )
    }
  }
}

export default observer(App)
