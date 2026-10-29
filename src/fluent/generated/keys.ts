import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '8d22f75a793f44d4b6445561cf950409'
                    }
                    'kyd-menu': {
                        table: 'sys_app_application'
                        id: '2382c3d9cd6f4950810310be290dc796'
                    }
                    'kyd-module-home': {
                        table: 'sys_app_module'
                        id: '6c47a0a0f0b24b89924cdfed301af168'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '842254e61d684f9db2568bbf6f00af06'
                    }
                }
                composite: [
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '0c65b666eaa548b0a2626e2b3748c194'
                        deleted: true
                        key: {
                            application_file: 'a9dc925c05eb4c3caa2415fc0ba4f93b'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '1dde9f1cb5d5400386954dc48d5d59f8'
                        key: {
                            name: 'x_giss2_kyd/vendor-react-dom--ef4d15ab'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '1de7d99a677b40698877fb76021d8af2'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm_kyd.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '2b206b9712b74463a79e4f39b394dba3'
                        deleted: true
                        key: {
                            application_file: '9f667946792e43dc8ba4ef0d6b0d9f63'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '31c0a74b49ca4f61ae7e4069d36b9e25'
                        key: {
                            name: 'x_giss2_kyd/main'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '4a52b6534d4c4b07a812f4a3ccd65d81'
                        deleted: true
                        key: {
                            endpoint: 'x_snc_kyd_fdm_kyd.do'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '4c6a20e3071a4006bdfa014b90725924'
                        key: {
                            application_file: '8ef11e0033c44f208bf464d21bc27564'
                            source_artifact: 'feb6d066b344412fb03e3b54c80e15b7'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '4f3ed15b96904afaa8bae20a41977e55'
                        key: {
                            application_file: '31c0a74b49ca4f61ae7e4069d36b9e25'
                            source_artifact: 'feb6d066b344412fb03e3b54c80e15b7'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '5539f2b9237c48bcbb8c667c844c470c'
                        key: {
                            endpoint: 'x_giss2_kyd_app.do'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '5b4b258a0b464421950b4a9d9df1bf17'
                        key: {
                            application_file: '7603bca4e1a549a1a0a032d4e2859ca8'
                            source_artifact: 'feb6d066b344412fb03e3b54c80e15b7'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '5d90a964d8114825a28516c3b88d9db7'
                        deleted: true
                        key: {
                            application_file: 'f251429b63b04a03b45cca9e1887433e'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '608d24058f4c41cdacba1e4e218de780'
                        deleted: true
                        key: {
                            application_file: 'aaaa37df2a064bbfbc9a5a957b728b3a'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '6af7a2df86aa46a69df88a356519abef'
                        deleted: true
                        key: {
                            application_file: 'a17d5b4931104b409e0cc81c88f3378e'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '6e085db02b0241eeb79881087c687030'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/vendor-cytoscape--68a9e77b'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '7603bca4e1a549a1a0a032d4e2859ca8'
                        key: {
                            name: 'x_giss2_kyd/vendor-cytoscape--68a9e77b'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '8247ef2c250140098f3ac5592646a1e0'
                        deleted: true
                        key: {
                            application_file: 'f2e39d7a7127470aaab991b54d98cc4b'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '83c88b23f936432f986e418f93c5a0bd'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/vendor-react-dom--ef4d15ab.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '8ef11e0033c44f208bf464d21bc27564'
                        key: {
                            name: 'x_giss2_kyd/vendor-lucide-react--c5e0b289'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '9cf654defdf34c2fbb9eeb8249659431'
                        deleted: true
                        key: {
                            application_file: '6e085db02b0241eeb79881087c687030'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '9d2e89d164824d088f4dc19d60780a52'
                        key: {
                            application_file: '5539f2b9237c48bcbb8c667c844c470c'
                            source_artifact: 'feb6d066b344412fb03e3b54c80e15b7'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '9d757a6a5129480abbd2283944922a04'
                        deleted: true
                        key: {
                            application_file: '4a52b6534d4c4b07a812f4a3ccd65d81'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '9f667946792e43dc8ba4ef0d6b0d9f63'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'a17d5b4931104b409e0cc81c88f3378e'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/vendor-cytoscape--68a9e77b.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'a9dc925c05eb4c3caa2415fc0ba4f93b'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/vendor-lucide-react--c5e0b289'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'aaaa37df2a064bbfbc9a5a957b728b3a'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'cfeec535811b4fa7a4c372318ad94780'
                        key: {
                            application_file: '1dde9f1cb5d5400386954dc48d5d59f8'
                            source_artifact: 'feb6d066b344412fb03e3b54c80e15b7'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'f251429b63b04a03b45cca9e1887433e'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/vendor-react-dom--ef4d15ab'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'f2e39d7a7127470aaab991b54d98cc4b'
                        deleted: true
                        key: {
                            name: 'x_snc_kyd_fdm/vendor-lucide-react--c5e0b289.js.map'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'feb6d066b344412fb03e3b54c80e15b7'
                        key: {
                            name: 'x_giss2_kyd_app.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'ff3668e28bcf4244bd2b69b513892b1e'
                        deleted: true
                        key: {
                            application_file: '83c88b23f936432f986e418f93c5a0bd'
                            source_artifact: '1de7d99a677b40698877fb76021d8af2'
                        }
                    },
                ]
            }
        }
    }
}
