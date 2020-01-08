import React from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import t from '../locale/locale'

export default props => {
    return (
        <View style={styles.categoryPanel}>
            {
                props.data !== 'undefined' && Object.keys(props.data).length > 0 && renderCategoryItems(props.data, props)
            }
        </View>)
}

const dw = Dimensions.get('window').width
const pidw = (dw - 20) / 4

const calWidth = (i, len) => ((len - i) >= 4) || (len % 4 == 0) ? { width: pidw } : { width: (dw - 20) / (len % 4) }
const calBorder = (i) => {
    if (i == 0) return { borderLeftWidth: 1, borderTopWidth: 1 }
    else if (i > 0 && i < 4) return { borderTopWidth: 1 }
    else if (i % 4 == 0) return { borderLeftWidth: 1 }
}

const renderCategoryItems = (data, props) => {
    var items = []
    var respond = []
    var m = 0
    var n = 0;
    delete data._id
    delete data.__v
    var len = Object.keys(data).length
    var keys = Object.keys(data)
    for (let i = 0; i < len; i++) {
        items[n] = <CategoryItem
            style={[calWidth(i, len), calBorder(i)]} key={i}
            image={keys[i]}
            title={keys[i]}
            {...props}
        />
        n++
        if ((i > 0 && (i + 1) % 4 == 0 && (len - i) >= 4) || i == len - 1) {
            respond[m] = (
                <View style={styles.row}>
                    {items}
                </View>
            )
            m++
            items = []
            n = 0
        }
    }
    return respond
}

const CategoryItem = (props) => (
    <TouchableOpacity activeOpacity={0.6} onPress={() => props.push('Categories', {
        'title': props.title
    })} style={[styles.categoryPanelItem, props.style]}>
        <Image
            resizeMode='cover'
            style={styles.CIImage}
            defaultSource={require('../assets/placeholder.png')}
            source={{ uri: `https://teliera-public.herokuapp.com/static/categories/${props.image}.png` }}
        />
        <Text style={styles.PITitle}>{t(props.title)}</Text>
    </TouchableOpacity>
)


const styles = StyleSheet.create({
    categoryPanel: {
        width: dw - 10,
        margin: 5,
        marginTop: 0,
        backgroundColor: 'rgb(245,245,245)',
        padding: 5
    },
    categoryPanelItem: {
        height: pidw,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center'
    },
    row: { flexDirection: 'row', width: dw - 10 },
    CIImage: { width: pidw / 3, height: pidw / 3 },
    PITitle: { fontSize: 10, width: pidw, textAlign: 'center', padding: 2, paddingTop: 5 }
})