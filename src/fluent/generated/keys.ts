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
                    'kyd-analysis-create': {
                        table: 'sys_security_acl'
                        id: 'd1a9e52cfe594e72be01f1a1dad9ad66'
                    }
                    'kyd-analysis-delete': {
                        table: 'sys_security_acl'
                        id: '24004c372c4640b8b56610760938d383'
                    }
                    'kyd-analysis-read': {
                        table: 'sys_security_acl'
                        id: '2af78edf47514f08bd60eb40404e3943'
                    }
                    'kyd-analysis-write': {
                        table: 'sys_security_acl'
                        id: '51aad07874dd477889405e0ac53ea954'
                    }
                    'kyd-menu': {
                        table: 'sys_app_application'
                        id: '2382c3d9cd6f4950810310be290dc796'
                    }
                    'kyd-module-analyses': {
                        table: 'sys_app_module'
                        id: 'cdefd4e9f00b4267818c361a1604728f'
                    }
                    'kyd-module-home': {
                        table: 'sys_app_module'
                        id: '6c47a0a0f0b24b89924cdfed301af168'
                    }
                    'kyd-queue-analysis': {
                        table: 'sys_script'
                        id: '7e2ff620cfb74b138bf2b77709911909'
                    }
                    'kyd-read-sn_build_agent_conversation': {
                        table: 'sys_scope_privilege'
                        id: 'a8e84e38cd124d3983d85c845e74aa02'
                    }
                    'kyd-read-sn_build_agent_message': {
                        table: 'sys_scope_privilege'
                        id: 'e99d88380aac4f0d999a5a2bc412bda9'
                    }
                    'kyd-read-sn_build_agent_script_request': {
                        table: 'sys_scope_privilege'
                        id: 'ea45f1fb06714d4cb5dac2c481113170'
                    }
                    'kyd-rest-analysis': {
                        table: 'sys_ws_operation'
                        id: 'e08fcdde92d24d9196b51593e4f0900d'
                    }
                    'kyd-rest-api': {
                        table: 'sys_ws_definition'
                        id: '28fd02ae30434bd792cf8e8965f14347'
                    }
                    'kyd-rest-candidates': {
                        table: 'sys_ws_operation'
                        id: 'a4040dd052264c41a6645c0ae9461e2c'
                    }
                    'kyd-rest-create-analysis': {
                        table: 'sys_ws_operation'
                        id: '9fff6c73243a4265b7eb9f90dd33dc15'
                    }
                    'kyd-rest-developer-analyses': {
                        table: 'sys_ws_operation'
                        id: 'ec440b2824714ce097ba51133fe9c137'
                    }
                    'kyd-rest-developers': {
                        table: 'sys_ws_operation'
                        id: '31584595e3204863974b859d3537605a'
                    }
                    'kyd-run-analysis': {
                        table: 'sysevent_script_action'
                        id: '9f34efbd739142438906a4da9c6cf0f5'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '842254e61d684f9db2568bbf6f00af06'
                    }
                    src_server_analysis_config_ts: {
                        table: 'sys_module'
                        id: '5154f7b4122348c7872308fca9150e19'
                    }
                    src_server_analysis_engine_ts: {
                        table: 'sys_module'
                        id: '536399c578de41a4a7b82a37e33d6fce'
                    }
                    src_server_analysis_graph_ts: {
                        table: 'sys_module'
                        id: '31dabb8090664ad585024cc3e246dfa2'
                    }
                    src_server_analysis_identity_ts: {
                        table: 'sys_module'
                        id: 'bac984dc80fc451a86a93ddefba184b2'
                    }
                    src_server_analysis_messages_ts: {
                        table: 'sys_module'
                        id: 'c69404d4ab1c4b7398d4a172619ed284'
                    }
                    src_server_analysis_metadata_ts: {
                        table: 'sys_module'
                        id: 'c09245de315b4f8c8aca855d0481cb81'
                    }
                    src_server_analysis_run_ts: {
                        table: 'sys_module'
                        id: '95b5d3b27035400a89503bd873f2c404'
                    }
                    src_server_analysis_util_ts: {
                        table: 'sys_module'
                        id: '211fcfd0d5aa4419a15938adabb213f3'
                    }
                    'src_server_automation_queue-analysis_ts': {
                        table: 'sys_module'
                        id: 'b464f5acf1ee481983bbca02495bec31'
                    }
                    'src_server_automation_run-analysis-action_ts': {
                        table: 'sys_module'
                        id: '7898607074c84571ad5f63db62a7b624'
                    }
                    src_server_rest_handlers_ts: {
                        table: 'sys_module'
                        id: 'e989350100bb4e0a8bffd7fe85adbd16'
                    }
                    src_server_rest_serialize_ts: {
                        table: 'sys_module'
                        id: 'cdd74ecdb27843cb88e91c6d97719047'
                    }
                    'x-giss2-kyd-analysis-requested-event': {
                        table: 'sysevent_register'
                        id: '1b9d1e0f630b42959ef8f2dbcf637420'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_element'
                        id: '0134dd0ab7064a558729ebf68cc36b8f'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '01e42f9fd364431fb89cc0e94dfbf6fe'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                            value: 'running'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '04db814da6aa4d198fa6fbe58745bf1c'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'period_from'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '0705d53dbf674bcd87b8c94d9a6a9075'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'period_to'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '074237cfba384b62892e33bf591f95b6'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'conversations'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '09fec85fb00b49e9904de20b86898ce4'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            caption: 'Analisi'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
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
                        table: 'sys_ui_element'
                        id: '0ece4224044f4db9b6c9e5713ed44d0d'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '0f423720db1942b6913646086921fc56'
                        key: {
                            sys_ui_form: {
                                id: 'b348009b036d42f9855437c5548be5c7'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '100f3cf82cd04987961e071761db10e9'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Risultato'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '100f3cf82cd04987961e071761db10e9'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            caption: 'Risultato'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '147e0ac830554145adeb8ed37377d54b'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'tool_success_rate'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '17cf55b1800f458cb27c7b59b59a00b4'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'tool_success_rate'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '194ff8290d764a0da4adacff833d1b1e'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'period_to'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '1a41f9e7e4014991b7a04d93234b04ed'
                        key: {
                            sys_security_acl: 'd1a9e52cfe594e72be01f1a1dad9ad66'
                            sys_user_role: {
                                id: '9a6c5b71d5ba4ec4805ee5a21a61e1f1'
                                key: {
                                    name: 'x_giss2_kyd.user'
                                }
                            }
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
                        table: 'sys_security_acl_role'
                        id: '20df6cd77293413882670b404b01b594'
                        key: {
                            sys_security_acl: '2af78edf47514f08bd60eb40404e3943'
                            sys_user_role: {
                                id: '9a6c5b71d5ba4ec4805ee5a21a61e1f1'
                                key: {
                                    name: 'x_giss2_kyd.user'
                                }
                            }
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
                        table: 'sys_documentation'
                        id: '2e05a89d4f734cd280e9c47323c70037'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'status_message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '2ff75ffa4baf4790b3d5ca18644f98c0'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'period_from'
                            position: '7'
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
                        table: 'sys_ui_element'
                        id: '31cfc0b3b7694a098247038cfe227023'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '324920bc379949e2a05693eca7094b26'
                        key: {
                            category: 'x_giss2_kyd_analysis'
                            prefix: 'KYD'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '359d407cfc584439865e3c68318b6323'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3aab1ed276e542e791a2980e90ff17a5'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'functional_artifacts'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3b88c15a9cad40e381803b41ba735f10'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'number'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3c9be70cd1a448f4af3ec078098e3df2'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'period_from'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3d409b425d2f467fab875de4edcea786'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '3d7ee32071de4eb78f57ab31dfe76675'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3ff73065390e4067a92d67d4ec0ee34f'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'functional_artifacts'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '46b554fbb29c4327a9a26a360120bd57'
                        key: {
                            sys_ui_section: {
                                id: '100f3cf82cd04987961e071761db10e9'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Risultato'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'result'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '48d9078a103f4d75ad57876f97a55c89'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'completed_on'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '494fb16cbe214f009d1452add0f57d48'
                        key: {
                            sys_ui_section: {
                                id: '100f3cf82cd04987961e071761db10e9'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Risultato'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'error_message'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '49737f07ffec402688845f5eb08e6160'
                        key: {
                            sys_ui_form: {
                                id: 'b348009b036d42f9855437c5548be5c7'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '499e136aa9ed4c41b6d7c83ecfd48d93'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'developer'
                            language: 'en'
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
                        table: 'sys_ui_element'
                        id: '4e055d3a72944514bf8defb5f1d68323'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '11'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4e565b867d1f478aafeddd103b402322'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'functional_artifacts'
                            position: '4'
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
                        table: 'sys_dictionary'
                        id: '508ebab9fe1a4c839a4ed32c33d409ff'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'developer'
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
                        table: 'sys_documentation'
                        id: '58d7a7a9a7774d96aab98a17fa5cd214'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'prompts'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '5a0c2d12977046d0934a555b951951f0'
                        key: {
                            sys_ui_section: {
                                id: 'd285077dc77745d09e981a1287e7a1eb'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Indicatori'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'prompts'
                            position: '2'
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
                        table: 'sys_ui_element'
                        id: '5f4868e7dd0f4076a3f64c6c1cb3427e'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'completed_on'
                            position: '10'
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
                        table: 'sys_dictionary'
                        id: '612c9cf2504149a2a3758a4d0db593f8'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'started_on'
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
                        table: 'sys_dictionary'
                        id: '6cfd0baa73704c11abb056b861489a00'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'conversations'
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
                        table: 'sys_ui_element'
                        id: '7d9de31fcbea482da63ab751d793dc7b'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'status_message'
                            position: '5'
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
                        table: 'sys_ui_element'
                        id: '85e7821bc0134efe97c3932f05a1bf0c'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'state'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '860bb4871d83403494c0bab33f553ac9'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'started_on'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '89429449b09e440d8a2d4ff875f6037a'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'started_on'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8a1f036a3bbf4d0f892190bf490d7660'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'result'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '8ac89c3f38764a2bab8a2c15820341a8'
                        key: {
                            sys_security_acl: '24004c372c4640b8b56610760938d383'
                            sys_user_role: {
                                id: '8dbf9ba175a049c89f1efa5bdd45d6fa'
                                key: {
                                    name: 'x_giss2_kyd.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '8dbf9ba175a049c89f1efa5bdd45d6fa'
                        key: {
                            name: 'x_giss2_kyd.admin'
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
                        table: 'sys_security_acl_role'
                        id: '8f30b4456c7d4510a093d91421a04961'
                        key: {
                            sys_security_acl: '51aad07874dd477889405e0ac53ea954'
                            sys_user_role: {
                                id: '8dbf9ba175a049c89f1efa5bdd45d6fa'
                                key: {
                                    name: 'x_giss2_kyd.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '90f66883cdd142dba9f7bba97c7c3511'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'conversations'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '98457d0a84154e7db3af84e72b069eb0'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                            value: 'queued'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '98c67fdeb45e428a9174a39782001c39'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'requested_by'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '9a6c5b71d5ba4ec4805ee5a21a61e1f1'
                        key: {
                            name: 'x_giss2_kyd.user'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9ae3bf4a70bc480fb781d337102cb4f8'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'status_message'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9c1fbbf38f4844f291b58897d6e8fb61'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'NULL'
                            language: 'en'
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
                        table: 'sys_dictionary'
                        id: 'a0c87338ba0e44329d6a244368167a80'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'requested_by'
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
                        table: 'sys_choice_set'
                        id: 'a53228c2d48e4e0fb8385879f2615ace'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: 'a56686292d21499f9c664e7cde52c360'
                        key: {
                            sys_ui_form: {
                                id: 'b348009b036d42f9855437c5548be5c7'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
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
                        table: 'sys_dictionary'
                        id: 'ae059676238d41d6a6bc9ee0660e2dba'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'error_message'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'aeee06666753455e865ad06fc6161555'
                        key: {
                            sys_ui_section: {
                                id: '09fec85fb00b49e9904de20b86898ce4'
                                key: {
                                    name: 'x_giss2_kyd_analysis'
                                    caption: 'Analisi'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'developer'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'af4e0c3e6a114620b153cf853e1bdf3e'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b0df0b20071041adab82bc4a655eaff7'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: 'b348009b036d42f9855437c5548be5c7'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bb5f5783f5bf4f21b95d994483071784'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'tool_success_rate'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_user_role_contains'
                        id: 'bceff2d13e564246b84c5d0c7eee9c34'
                        key: {
                            role: {
                                id: '8dbf9ba175a049c89f1efa5bdd45d6fa'
                                key: {
                                    name: 'x_giss2_kyd.admin'
                                }
                            }
                            contains: {
                                id: '9a6c5b71d5ba4ec4805ee5a21a61e1f1'
                                key: {
                                    name: 'x_giss2_kyd.user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c0596d75f46f491cb2f455490cb1ea2a'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'error_message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c1681834495f4efc86f913df94cb8399'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c319fa9181984e59857d01027011589c'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                            value: 'error'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c55aff9d4c4e45feb0b21e9abed9da54'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'period_to'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'c7473327a6d845eebe47d14ecad03c14'
                        key: {
                            name: 'x_giss2_kyd_analysis'
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
                        table: 'sys_ui_section'
                        id: 'd285077dc77745d09e981a1287e7a1eb'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            caption: 'Indicatori'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd36a5a09684945acaf1108f201271eb9'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd3e1d02701774d1a8d936364c4c806e2'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'requested_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dcb20f21d548426f8e358220e4e8afdd'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'result'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'deed4454c2864e389e31a4ccadecc118'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e4d10aecfcfb442faba2ab288603acf9'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e5707a3e4c8e48fa8e7e443c9e081288'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'completed_on'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'edaab5ebd5254dafa67120164ade464c'
                        key: {
                            logical_table_name: 'x_giss2_kyd_analysis'
                            col_name_string: 'developer,sys_created_on'
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
                        table: 'sys_dictionary'
                        id: 'fe40a85380724a95b8411b043774a40e'
                        key: {
                            name: 'x_giss2_kyd_analysis'
                            element: 'prompts'
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
