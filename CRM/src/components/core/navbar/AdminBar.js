import React from 'react'
import { connect } from "react-redux";
import PropTypes from "prop-types";
// import { logout } from '../../../actions/auth'
import SideBar from '../../common/SideBar'

const AdminBar = ({}) => {
    const titles = [
     {
        key:'product',
        icon:'layout',
        main: 'Product',
        sub: [{
            name: 'Add Product',
            path: '/add-product'
        }, {
            name: 'Manage products',
            path: '/manage-products'
        }]
        },
        {
            key:'orders',
            icon: 'layout',
            main: 'Order',
            sub: [ {
                name: 'Manage Orders',
                path: '/manage-orders'
            }]
        }
    ]

    return (
        <SideBar titles={titles}/>
    )
}
// AdminBar.propTypes = {
//     logout: PropTypes.func.isRequired
// }

export default connect(null, { })(AdminBar)
