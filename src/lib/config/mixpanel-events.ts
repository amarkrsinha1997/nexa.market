/**
 * Mixpanel Event Names Configuration
 * Centralized location for all Mixpanel event tracking names
 * 
 * Naming Convention:
 * - All events use UPPERCASE_WITH_UNDERSCORES format for script compatibility
 * - Be descriptive and specific - include page/feature context in the name
 * - Page Views: "[PAGE_NAME]_PAGE_VIEW"
 * - Element Clicks: "[PAGE/FEATURE]_[ELEMENT]_CLICKED"
 * - Examples: "LANDING_PAGE_BUY_NEXA_CLICKED", "USER_HOME_SIDEBAR_CLICKED"
 */

export const MixpanelEvents = {
    // ========================================
    // PAGE VIEWS (handled by MixpanelProvider)
    // ========================================
    PAGE_VIEW: (pageName: string) => `${pageName.toUpperCase().replace(/ /g, '_')}_PAGE_VIEW`,

    // ========================================
    // AUTHENTICATION & ONBOARDING
    // ========================================
    USER_ONBOARDING_COMPLETED: "USER_ONBOARDING_COMPLETED",
    USER_LOGOUT_CLICKED: "USER_LOGOUT_CLICKED",
    ADMIN_LOGOUT_CLICKED: "ADMIN_LOGOUT_CLICKED",

    // ========================================
    // NAVIGATION - USER
    // ========================================
    USER_HOME_MENU_CLICKED: "HOME_MENU_CLICKED",
    USER_PROFILE_MENU_CLICKED: "HOME_MENU_CLICKED",
    USER_LEDGER_MENU_CLICKED: "HOME_MENU_CLICKED",

    // ========================================
    // NAVIGATION - ADMIN
    // ========================================
    ADMIN_DASHBOARD_MENU_CLICKED: "HOME_MENU_CLICKED",
    ADMIN_LEDGER_MENU_CLICKED: "HOME_MENU_CLICKED",
    ADMIN_UPI_MENU_CLICKED: "HOME_MENU_CLICKED",
    ADMIN_PROFILE_MENU_CLICKED: "HOME_MENU_CLICKED",
    ADMIN_SETTINGS_MENU_CLICKED: "HOME_MENU_CLICKED",
    ADMIN_TO_USER_VIEW_SWITCHED: "ADMIN_TO_USER_VIEW_SWITCHED",
    USER_TO_ADMIN_PORTAL_CLICKED: "USER_TO_ADMIN_PORTAL_CLICKED",

    // ========================================
    // LANDING PAGE
    // ========================================
    LANDING_PAGE_SCROLLED_50_PERCENT: "LANDING_PAGE_SCROLLED_50_PERCENT",
    LANDING_PAGE_LOGO_CLICKED: "LANDING_PAGE_LOGO_CLICKED",
    LANDING_PAGE_SIGN_IN_CLICKED: "LANDING_PAGE_SIGN_IN_CLICKED",
    LANDING_PAGE_BUY_NEXA_CLICKED: "LANDING_PAGE_BUY_NEXA_CLICKED",
    LANDING_PAGE_VIEW_MARKETS_CLICKED: "LANDING_PAGE_VIEW_MARKETS_CLICKED",

    // ========================================
    // EXCHANGE / BUY NEXA FLOW
    // ========================================
    EXCHANGE_FORM_AMOUNT_ENTERED: "EXCHANGE_FORM_AMOUNT_ENTERED",
    EXCHANGE_FORM_WALLET_EDIT_CLICKED: "EXCHANGE_FORM_WALLET_EDIT_CLICKED",
    EXCHANGE_FORM_WALLET_SAVED: "EXCHANGE_FORM_WALLET_SAVED",
    EXCHANGE_FORM_WALLET_ADDRESS_COPIED: "EXCHANGE_FORM_WALLET_ADDRESS_COPIED",
    EXCHANGE_FORM_BUY_NEXA_CLICKED: "EXCHANGE_FORM_BUY_NEXA_CLICKED",

    // ========================================
    // PAYMENT FLOW
    // ========================================
    PAYMENT_PAGE_PAY_BUTTON_CLICKED: "PAYMENT_PAGE_PAY_BUTTON_CLICKED",
    PAYMENT_PAGE_UPI_AUTO_TRIGGERED: "PAYMENT_PAGE_UPI_AUTO_TRIGGERED",
    PAYMENT_PAGE_CONFIRM_CLICKED: "PAYMENT_PAGE_CONFIRM_CLICKED",
    PAYMENT_PAGE_DESTINATION_ADDRESS_COPIED: "PAYMENT_PAGE_DESTINATION_ADDRESS_COPIED",
    LEDGER_DESTINATION_ADDRESS_COPIED: "LEDGER_DESTINATION_ADDRESS_COPIED",
    ORDER_DETAILS_BACK_CLICKED: "ORDER_DETAILS_BACK_CLICKED",
    ORDER_DETAILS_HOME_CLICKED: "ORDER_DETAILS_HOME_CLICKED",

    // ========================================
    // USER PROFILE & WALLET
    // ========================================
    USER_PROFILE_PHONE_UPDATED: "USER_PROFILE_PHONE_UPDATED",
    USER_WALLET_ADDRESS_UPDATED: "USER_WALLET_ADDRESS_UPDATED",

    // ========================================
    // LEDGER
    // ========================================
    LEDGER_FILTER_PENDING_CLICKED: "LEDGER_FILTER_PENDING_CLICKED",
    LEDGER_FILTER_FAILED_CLICKED: "LEDGER_FILTER_FAILED_CLICKED",
    LEDGER_FILTER_COMPLETED_CLICKED: "LEDGER_FILTER_COMPLETED_CLICKED",
    LEDGER_FILTER_ALL_CLICKED: "LEDGER_FILTER_ALL_CLICKED",
    LEDGER_TAB_CHANGED: "LEDGER_TAB_CHANGED",
    LEDGER_ORDER_HISTORY_TOGGLED: "LEDGER_ORDER_HISTORY_TOGGLED",
    LEDGER_PAYMENT_FAILED_REPROCESS_CLICKED: "LEDGER_PAYMENT_FAILED_REPROCESS_CLICKED",
    LEDGER_LOAD_MORE_CLICKED: "LEDGER_LOAD_MORE_CLICKED",

    // ========================================
    // ADMIN - ORDERS
    // ========================================
    ADMIN_ORDER_CHECK_CLICKED: "ADMIN_ORDER_CHECK_CLICKED",
    ADMIN_ORDER_DECISION_MADE: "ADMIN_ORDER_DECISION_MADE",
    ADMIN_ORDER_REPROCESS_CLICKED: "ADMIN_ORDER_REPROCESS_CLICKED",
    ADMIN_ORDER_CHECK_LOCKED: "ADMIN_ORDER_CHECK_LOCKED",
    ADMIN_ORDER_PAYMENT_APPROVED: "ADMIN_ORDER_PAYMENT_APPROVED",
    ADMIN_ORDER_REJECTED: "ADMIN_ORDER_REJECTED",

    // ========================================
    // ADMIN - PROFILE
    // ========================================
    ADMIN_PROFILE_PHONE_UPDATED: "ADMIN_PROFILE_PHONE_UPDATED",
    ADMIN_PROFILE_WALLET_UPDATED: "ADMIN_PROFILE_WALLET_UPDATED",

    // ========================================
    // ADMIN - SETTINGS
    // ========================================
    ADMIN_SETTINGS_PRICE_UPDATE_CLICKED: "ADMIN_SETTINGS_PRICE_UPDATE_CLICKED",

    // ========================================
    // ADMIN - UPI MANAGEMENT
    // ========================================
    ADMIN_UPI_FILTER_STATUS_CHANGED: "ADMIN_UPI_FILTER_STATUS_CHANGED",
    ADMIN_UPI_ADD_CLICKED: "ADMIN_UPI_ADD_CLICKED",
    ADMIN_UPI_TOGGLE_CLICKED: "ADMIN_UPI_TOGGLE_CLICKED",
    ADMIN_UPI_DELETE_CONFIRMED: "ADMIN_UPI_DELETE_CONFIRMED",

    // ========================================
    // NOTIFICATIONS
    // ========================================
    NOTIFICATION_SUBSCRIBE_CLICKED: "NOTIFICATION_SUBSCRIBE_CLICKED",
    NOTIFICATION_LATER_CLICKED: "NOTIFICATION_LATER_CLICKED",
} as const;

// Type for event name values
export type MixpanelEventName = typeof MixpanelEvents[keyof typeof MixpanelEvents] | ReturnType<typeof MixpanelEvents.PAGE_VIEW>;
