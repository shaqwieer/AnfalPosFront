import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { useMainStore } from '@/stores/mainStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '/reports',
          name: 'reports',
          component: () => import('@/views/pages/reports/Reports.vue')
        },
        {
          path: 'items-availability',
          name: 'Inventory',
          component: () => import('@/views/pages/Inventory/SCInventoryPage.vue')
        },
        {
          path: 'invoices/draft',
          name: 'DraftOrders',
          component: () => import('@/views/pages/orders/DraftOrders.vue')
        },
        {
          path: 'invoices/history',
          name: 'OrderHistory',
          component: () => import('@/views/pages/orders/OrderHistory.vue')
        },
        {
          path: 'sap/items',
          name: 'ItemsPage',
          component: () => import('@/views/pages/ItemsPage.vue')
        },
        {
          path: 'customer-list',
          name: 'CustomerList',
          component: () => import('@/views/pages/customer/VANCustomers.vue')
        },
        {
          path: 'customer-visit',
          name: 'customer-visit',
          component: () => import('@/views/pages/customer/customers/VANCustomerVisit.vue')
        },
        {
          path: 'customer-code',
          name: 'customer-code',
          component: () => import('@/views/pages/customerCodes/customerCodes.vue')
        },
        {
          path: 'payment-term',
          name: 'payment-term',
          component: () => import('@/views/pages/paymentTerm/paymentTerm.vue')
        },
        {
          path: 'expense-types',
          name: 'expense-types',
          component: () => import('@/views/pages/expenseTypes/expenseTypes.vue')
        },
        {
          path: 'customer-dashboard',
          name: 'customer-dashboard',
          component: () => import('@/views/pages/customer/customers/CustomerDashboard.vue')
        },
        {
          path: 'session-analytics',
          name: 'Sessions',
          meta: {
            breadcrumb: ['Session Managment']
          },
          component: () => import('@/views/pages/session/SessionManagement.vue')
        },
        {
          path: 'visit-analytics',
          name: 'Visits',
          meta: {
            breadcrumb: ['Visit Managment']
          },
          component: () => import('@/views/pages/visits/VisitManagement.vue')
        },
        {
          path: '/invoices/quick-invoice',
          name: 'Quickinvoice',
          meta: {
            breadcrumb: ['Quickinvoice']
          },
          component: () => import('@/views/pages/invoice/QuickInvoice.vue')
        },
        {
          path: '/invoices/payments',
          name: 'Payments',
          meta: {
            breadcrumb: ['Payments']
          },
          component: () => import('@/views/pages/payments/payments.vue')
        },
        {
          path: '/work-board',
          name: 'Work Board',
          component: () => import('@/views/pages/kanbanBoard/KanbanBoard.vue')
        },
        {
          path: '/plants',
          name: 'Plants',
          meta: {
            breadcrumb: ['Plants']
          },
          component: () => import('@/views/pages/branch/branch.vue')
        },
        {
          path: '/companies',
          name: 'Companies',
          meta: {
            breadcrumb: ['Companies']
          },
          component: () => import('@/views/pages/organization/organization.vue')
        },
        {
          path: '/settings/invoices/payment-methods',
          name: 'PaymentMethods',
          meta: {
            breadcrumb: ['PaymentMethods']
          },
          component: () => import('@/views/pages/paymentMethods/paymentMethods.vue')
        },
        {
          path: '/settings/plants/cities',
          name: 'Cities',
          meta: {
            breadcrumb: ['Cities']
          },
          component: () => import('@/views/pages/city/city.vue')
        },
        {
          path: '/settings/companies/invoice-templates',
          name: 'InvoiceTemplates',
          meta: {
            breadcrumb: ['InvoiceTemplates']
          },
          component: () => import('@/views/pages/invoiceTemplate/invoiceTemplate.vue')
        },
        {
          path: '/settings/plants/branch-types',
          name: 'BranchTypes',
          meta: {
            breadcrumb: ['BranchTypes']
          },
          component: () => import('@/views/pages/branchType/branchType.vue')
        },
        {
          path: '/settings/plants/countries',
          name: 'Countries',
          meta: {
            breadcrumb: ['Countries']
          },
          component: () => import('@/views/pages/country/country.vue')
        },
        {
          path: '/settings/companies/organization-types',
          name: 'OrganizationTypes',
          meta: {
            breadcrumb: ['OrganizationTypes']
          },
          component: () => import('@/views/pages/organizationType/organizationType.vue')
        },
        {
          path: '/users-roles',
          name: 'userRoles',
          meta: {
            breadcrumb: ['userRoles']
          },
          component: () => import('@/views/pages/userRolePage/userRole.vue')
        },

        // {
        //     path: '/Quickinvoice2',
        //     name: 'Quickinvoice2',
        //     component: () => import('@/views/pages/oldInvoice/QuickInvoice.vue')
        // },
        {
          path: '/',
          name: 'e-commerce',
          meta: {
            breadcrumb: ['Dashboard']
          },
          component: () => import('@/views/dashboards/VANDashboard.vue')
        },
        {
          path: '/van-dashboard',
          name: 'van-dashboard',
          meta: {
            breadcrumb: ['Van Sales Dashboard']
          },
          component: () => import('@/views/dashboards/VANDashboard.vue')
        },
        {
          path: '/invoices-excel-upload',
          name: 'InvoiceExcelUpload',
          meta: {
            breadcrumb: ['Invoices', 'Excel Upload']
          },
          component: () => import('@/views/pages/invoice/ExcelInvoiceUpload.vue')
        },
        {
          path: '/dashboard-banking',
          name: 'dashboard-banking',
          meta: {
            breadcrumb: ['Banking Dashboard']
          },
          component: () => import('@/views/dashboards/Banking.vue')
        },
        {
          path: '/apps/blog/list',
          component: () => import('@/views/apps/blog/List.vue')
        },
        {
          path: '/apps/blog/detail',
          component: () => import('@/views/apps/blog/Detail.vue')
        },
        {
          path: '/apps/blog/edit',
          name: 'blog-edit',
          component: () => import('@/views/apps/blog/Edit.vue')
        },
        {
          path: '/apps/calendar',
          name: 'calendar',
          component: () => import('@/views/apps/Calendar.vue')
        },
        {
          path: '/apps/files',
          name: 'files',
          meta: { requiresAuth: true },
          component: () => import('@/views/apps/Files.vue')
        },
        {
          path: '/apps/chat',
          name: 'chat',
          component: () => import('@/views/apps/chat/Index.vue')
        },
        {
          path: '/apps/tasklist',
          name: 'tasklist',
          component: () => import('@/views/apps/tasklist/Index.vue')
        },
        {
          path: '/apps/mail',

          component: () => import('@/views/apps/mail/Index.vue'),
          children: [
            {
              path: '/apps/mail/inbox',
              name: 'mail-inbox',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            },
            {
              path: '/apps/mail/compose',
              name: 'mail-compose',
              component: () => import('@/views/apps/mail/ComposeNew.vue')
            },
            {
              path: '/apps/mail/detail/:id',
              name: 'mail-detail',
              component: () => import('@/views/apps/mail/Detail.vue')
            },
            {
              path: '/apps/mail/starred',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            },
            {
              path: '/apps/mail/spam',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            },
            {
              path: '/apps/mail/important',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            },
            {
              path: '/apps/mail/sent',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            },
            {
              path: '/apps/mail/archived',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            },
            {
              path: '/apps/mail/trash',
              component: () => import('@/views/apps/mail/MailTypes.vue')
            }
          ]
        },
        {
          path: '/uikit/formlayout',
          name: 'formlayout',
          meta: {
            breadcrumb: ['UI Kit', 'Form Layout']
          },
          component: () => import('@/views/uikit/FormLayout.vue')
        },
        {
          path: '/uikit/input',
          name: 'input',
          meta: {
            breadcrumb: ['UI Kit', 'Input']
          },
          component: () => import('@/views/uikit/Input.vue')
        },
        {
          path: '/uikit/floatlabel',
          name: 'floatlabel',
          meta: {
            breadcrumb: ['UI Kit', 'Float Label']
          },
          component: () => import('@/views/uikit/FloatLabel.vue')
        },
        {
          path: '/uikit/invalidstate',
          name: 'invalidstate',
          meta: {
            breadcrumb: ['UI Kit', 'Invalid State']
          },
          component: () => import('@/views/uikit/InvalidState.vue')
        },
        {
          path: '/uikit/button',
          name: 'button',
          meta: {
            breadcrumb: ['UI Kit', 'Button']
          },
          component: () => import('@/views/uikit/Button.vue')
        },
        {
          path: '/uikit/table',
          name: 'table',
          meta: {
            breadcrumb: ['UI Kit', 'Table']
          },
          component: () => import('@/views/uikit/Table.vue')
        },
        {
          path: '/uikit/list',
          name: 'list',
          meta: {
            breadcrumb: ['UI Kit', 'List']
          },
          component: () => import('@/views/uikit/List.vue')
        },
        {
          path: '/uikit/tree',
          name: 'tree',
          meta: {
            breadcrumb: ['UI Kit', 'Tree']
          },
          component: () => import('@/views/uikit/Tree.vue')
        },
        {
          path: '/uikit/panel',
          name: 'panel',
          meta: {
            breadcrumb: ['UI Kit', 'Panel']
          },
          component: () => import('@/views/uikit/Panels.vue')
        },

        {
          path: '/uikit/overlay',
          name: 'overlay',
          meta: {
            breadcrumb: ['UI Kit', 'Overlay']
          },
          component: () => import('@/views/uikit/Overlay.vue')
        },
        {
          path: '/uikit/media',
          name: 'media',
          meta: {
            breadcrumb: ['UI Kit', 'Media']
          },
          component: () => import('@/views/uikit/Media.vue')
        },
        {
          path: '/uikit/menu',
          meta: {
            breadcrumb: ['UI Kit', 'Menu']
          },
          component: () => import('@/views/uikit/Menu.vue'),
          children: [
            {
              path: '/uikit/menu',
              meta: {
                breadcrumb: ['UI Kit', 'Menu']
              },
              component: () => import('@/views/uikit/menu/PersonalDemo.vue')
            },
            {
              path: '/uikit/menu/seat',
              meta: {
                breadcrumb: ['UI Kit', 'Menu', 'Seat']
              },
              component: () => import('@/views/uikit/menu/SeatDemo.vue')
            },
            {
              path: '/uikit/menu/payment',
              meta: {
                breadcrumb: ['UI Kit', 'Menu', 'Payment']
              },
              component: () => import('@/views/uikit/menu/PaymentDemo.vue')
            },
            {
              path: '/uikit/menu/confirmation',
              meta: {
                breadcrumb: ['UI Kit', 'Menu', 'Confirmation']
              },
              component: () => import('@/views/uikit/menu/ConfirmationDemo.vue')
            }
          ]
        },
        {
          path: '/uikit/message',
          name: 'message',
          meta: {
            breadcrumb: ['UI Kit', 'Message']
          },
          component: () => import('@/views/uikit/Messages.vue')
        },
        {
          path: '/uikit/file',
          name: 'file',
          meta: {
            breadcrumb: ['UI Kit', 'File']
          },
          component: () => import('@/views/uikit/File.vue')
        },
        {
          path: '/uikit/charts',
          name: 'charts',
          meta: {
            breadcrumb: ['UI Kit', 'Charts']
          },
          component: () => import('@/views/uikit/Chart.vue')
        },
        {
          path: '/uikit/misc',
          name: 'misc',
          meta: {
            breadcrumb: ['UI Kit', 'Misc']
          },
          component: () => import('@/views/uikit/Misc.vue')
        },
        {
          path: '/blocks',
          name: 'blocks',
          meta: {
            breadcrumb: ['Prime Blocks', 'Free Blocks']
          },
          component: () => import('@/views/utilities/Blocks.vue')
        },
        {
          path: '/utilities/colors',
          name: 'colors',
          component: () => import('@/views/utilities/Colors.vue')
        },
        {
          path: '/utilities/icons',
          name: 'icons',
          meta: {
            breadcrumb: ['Utilities', 'Prime Icons']
          },
          component: () => import('@/views/utilities/Icons.vue')
        },
        {
          path: '/pages/timeline',
          name: 'timeline',
          component: () => import('@/views/pages/Timeline.vue')
        },
        {
          path: '/pages/empty',
          name: 'empty',
          component: () => import('@/views/pages/Empty.vue')
        },
        {
          path: '/pages/crud',
          name: 'crud',
          component: () => import('@/views/pages/Crud.vue')
        },
        {
          path: '/ecommerce/product-overview',
          name: 'product-overview',
          meta: {
            breadcrumb: ['E-Commerce', 'Product Overview']
          },
          component: () => import('@/views/e-commerce/ProductOverview.vue')
        },
        {
          path: '/ecommerce/product-list',
          name: 'product-list',
          meta: {
            breadcrumb: ['E-Commerce', 'Product List']
          },
          component: () => import('@/views/e-commerce/ProductList.vue')
        },
        {
          path: '/ecommerce/new-product',
          name: 'new-product',
          meta: {
            breadcrumb: ['E-Commerce', 'New Product']
          },
          component: () => import('@/views/e-commerce/NewProduct.vue')
        },
        {
          path: '/ecommerce/shopping-cart',
          name: 'shopping-cart',
          meta: {
            breadcrumb: ['E-Commerce', 'Shopping Cart']
          },
          component: () => import('@/views/e-commerce/ShoppingCart.vue')
        },
        {
          path: '/ecommerce/checkout-form',
          name: 'checkout-form',
          meta: {
            breadcrumb: ['E-Commerce', 'Checkout Form']
          },
          component: () => import('@/views/e-commerce/CheckoutForm.vue')
        },
        {
          path: '/ecommerce/order-history',
          name: 'order-history',
          meta: {
            breadcrumb: ['E-Commerce', 'Order History']
          },
          component: () => import('@/views/e-commerce/OrderHistory.vue')
        },
        {
          path: '/ecommerce/order-summary',
          name: 'order-summary',
          meta: {
            breadcrumb: ['E-Commerce', 'Order Summary']
          },
          component: () => import('@/views/e-commerce/OrderSummary.vue')
        },
        {
          path: '/profile/create',
          name: 'user-create',
          meta: {
            breadcrumb: ['User Management', 'Create']
          },
          component: () => import('@/views/user-management/UserCreate.vue')
        },
        {
          path: '/profile/list',
          name: 'user-list',
          meta: {
            breadcrumb: ['User Management', 'List']
          },
          component: () => import('@/views/user-management/UserList.vue')
        },
        {
          path: '/documentation',
          name: 'documentation',
          component: () => import('@/views/utilities/Documentation.vue')
        },
        {
          path: '/pages/aboutus',
          name: 'aboutus',
          meta: {
            breadcrumb: ['Pages', 'About']
          },
          component: () => import('@/views/pages/AboutUs.vue')
        },
        {
          path: '/pages/contact',
          name: 'contact',
          component: () => import('@/views/pages/ContactUs.vue')
        },
        {
          path: '/pages/faq',
          name: 'faq',
          meta: {
            breadcrumb: ['Pages', 'FAQ']
          },
          component: () => import('@/views/pages/Faq.vue')
        },
        {
          path: '/pages/help',
          name: 'help',
          component: () => import('@/views/pages/Help.vue')
        },
        {
          path: '/salesrep-target',
          name: 'help',
          component: () => import('@/views/pages/targets/repTargets.vue')
        }
      ]
    },
    {
      path: '/available-branches',
      name: 'available-branches',
      component: () => import('@/views/pages/availableBranch/availableBranch.vue')
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('@/views/pages/Landing.vue')
    },
    {
      path: '/pages/notfound',
      name: 'notfound',
      component: () => import('@/views/pages/NotFound.vue')
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/pages/auth/Login.vue')
    },

    {
      path: '/auth/access',
      name: 'accessDenied',
      component: () => import('@/views/pages/auth/Access.vue')
    },
    {
      path: '/auth/error',
      name: 'error',
      component: () => import('@/views/pages/auth/Error.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/pages/auth/Register.vue')
    },
    {
      path: '/auth/forgotpassword',
      name: 'forgotpassword',
      component: () => import('@/views/pages/auth/ForgotPassword.vue')
    },
    {
      path: '/auth/newpassword',
      name: 'newpassword',
      component: () => import('@/views/pages/auth/NewPassword.vue')
    },
    {
      path: '/auth/verification',
      name: 'verification',
      component: () => import('@/views/pages/auth/Verification.vue')
    },
    {
      path: '/auth/lockscreen',
      name: 'lockscreen',
      component: () => import('@/views/pages/auth/LockScreen.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('@/views/pages/NotFound.vue')
    }
  ],
  scrollBehavior() {
    return { left: 0, top: 0 };
  }
});

router.beforeEach(async (to, from, next) => {
  console.log(`From: ${from.path}, To: ${to.path}`);
  const mainStore = useMainStore();
  const token = sessionStorage.getItem('Token') || localStorage.getItem('token');

  if (token && mainStore.pageTree.length == 0) {
    await mainStore.getMenu();
  }
  const hasBranchIdKey = true;
  const isAllowed = mainStore.accessAllowed(to.path);
  console.log(`Navigating to: ${to.path}, Allowed: ${isAllowed}`);

  if (!token && to.name !== 'login') {
    next({ name: 'login' });
  } else if (token && to.name === 'login') {
    next({ name: 'e-commerce' });
  } else if (token && !isAllowed) {
    next({ name: 'notfound' });
  } else if (token && !hasBranchIdKey && to.name !== 'van-dashboard') {
    next({ name: 'van-dashboard' });
  } else {
    next();
  }
});

export default router;
