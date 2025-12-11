'use strict'

const ROLES = {
   USER: 0,
   ADMIN: 1,
   SUPER_USER: 2
}

const ACCESS_CONTROL = {

   '/api/auth/read': [ROLES.SUPER_USER],

   '/api/orders/read-all': [ROLES.ADMIN,ROLES.SUPER_USER],
   '/api/orders/read-by-filter':[ROLES.ADMIN,ROLES.SUPER_USER],

   '/api/categories/create': [ROLES.ADMIN, ROLES.SUPER_USER],
   '/api/categories/update': [ROLES.ADMIN, ROLES.SUPER_USER],
   '/api/categories/delete': [ROLES.ADMIN, ROLES.SUPER_USER],
   
   '/api/cfg/change-time': [ROLES.ADMIN, ROLES.SUPER_USER],
   '/api/cfg/update-price-list': [ROLES.ADMIN, ROLES.SUPER_USER],
   '/api/cfg/read': [ROLES.ADMIN, ROLES.SUPER_USER],
   

   '/api/dishes/create': [ROLES.ADMIN, ROLES.SUPER_USER],
   '/api/dishes/update': [ROLES.ADMIN, ROLES.SUPER_USER],
   '/api/dishes/delete': [ROLES.ADMIN, ROLES.SUPER_USER],

   '/api/superuser/add-admin': [ROLES.SUPER_USER],
   '/api/superuser/del-admin': [ROLES.SUPER_USER],
   '/api/superuser/get-admins': [ROLES.SUPER_USER]
}

module.exports = { ROLES, ACCESS_CONTROL }