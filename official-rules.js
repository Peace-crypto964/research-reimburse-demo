// 2026-11-05 从“同济大学财务处只跑一次报销清单”微信小程序的各类型「报销」页读取。
// 仅用于课题组电子材料预收集；学校预约报销单由管理员后续在学校系统办理。
const item = (id, name, kind = 'required', extra = {}) => ({ id, name, kind, ...extra });
const invoice = (note = '') => item('invoice', '发票', 'required', { note });
const pay = () => item('payment', '支付记录', 'conditional', { minAmount: 1000, exclusive: true, note: '单笔业务金额超过 1000 元时提供' });
const detail = () => item('invoiceDetail', '发票明细或清单', 'conditional', { condition: 'invoiceNoDetail', minAmount: 500, note: '单笔采购达到 500 元且发票未列明细时提供' });
const contract = () => item('contract', '合同原件', 'conditional', { minAmount: 50000, note: '采购或服务金额达到 5 万元时提供' });
const serviceAcceptance = () => item('serviceAcceptance', '服务项目验收单', 'conditional', { minAmount: 10000, note: '服务或采购金额达到 1 万元时提供' });
const detailCondition = { id: 'invoiceNoDetail', label: '发票未列明细' };
const RULE_SOURCE = '同济大学财务处“只跑一次报销材料清单”小程序·报销页（2026-11-05 读取）';
const OFFICIAL_RULES = {
  experiment: { description: '专用材料购置费；按单笔采购金额判断验收单和合同', conditions: [detailCondition], materials: [invoice('单笔采购满 500 元应含明细'), detail(), pay(), item('acceptance', '材料（办公用品）/图书验收单', 'conditional', { minAmount: 20000, note: '采购金额达到 2 万元时提供；未达时在学校预约报销单验收人处签字' }), contract()] },
  office: { conditions: [detailCondition], materials: [invoice('定额发票需注明费用名称'), detail(), pay(), item('acceptance', '材料（办公用品）/图书验收单', 'conditional', { minAmount: 20000, note: '采购金额达到 2 万元时提供；未达时在学校预约报销单验收人处签字' }), contract()] },
  consumables: { conditions: [{ id: 'invoiceNoDetail', label: '发票未列明细' }], materials: [invoice('发票应包含明细'), item('invoiceDetail', '发票明细清单', 'conditional', { condition: 'invoiceNoDetail' }), pay(), item('acceptance', '同济大学低值品验收单'), contract()] },
  equipment: { conditions: [{ id: 'invoiceNoDetail', label: '发票未列明细' }], materials: [invoice('发票应包含明细'), item('invoiceDetail', '发票明细清单', 'conditional', { condition: 'invoiceNoDetail' }), pay(), item('acceptance', '同济大学仪器设备验收单'), contract()], later: '学校预约报销单须含同济大学资产清单。' },
  maintenance: { conditions: [detailCondition], materials: [invoice(), detail(), pay(), serviceAcceptance(), contract()] },
  testing: { conditions: [detailCondition], materials: [invoice(), detail(), pay(), serviceAcceptance(), contract()] },
  processing: { conditions: [detailCondition], materials: [invoice(), detail(), pay(), serviceAcceptance(), contract()] },
  collaboration: { conditions: [{ id: 'invoiceNoDetail', label: '发票未列明细' }], materials: [invoice('发票应包含明细'), item('invoiceDetail', '发票明细清单', 'conditional', { condition: 'invoiceNoDetail' }), pay(), item('contract', '合同') ] },
  outsourcing: { conditions: [detailCondition], materials: [invoice(), detail(), pay(), serviceAcceptance(), contract()] },
  software: { conditions: [detailCondition, { id: 'softwarePrice', label: '软件单价超过 1000 元' }], materials: [invoice(), detail(), pay(), item('acceptance', '软件验收单', 'conditional', { condition: 'softwarePrice', note: '软件单价超过 1000 元时提供' }), contract()] },
  localTravel: { conditions: [{ id: 'taxi', label: '发生出租车或网约车费用' }, { id: 'rental', label: '发生租车费用' }, { id: 'lodging', label: '发生住宿费用' }], materials: [item('tickets', '市内交通等费用票据', 'required', { note: '按实际发生费用提供；网约车须附行程单' }), item('rentalProof', '租车合同、协议或完整订单', 'conditional', { condition: 'rental' }), item('lodging', '住宿发票及必要清单', 'conditional', { condition: 'lodging' }), pay()] },
  travel: { conditions: [{ id: 'approval', label: '行政经费、校外人员、自驾/租车或住宿包干出差' }, { id: 'rental', label: '发生租车费用' }, { id: 'lodging', label: '发生住宿费用' }, { id: 'meeting', label: '发生会议注册费' }, { id: 'training', label: '发生培训费' }, { id: 'explain', label: '有需要单独说明的出差情况' }], materials: [item('tickets', '交通票据'), item('approval', '出差审批单或适用的正式邀请函', 'conditional', { condition: 'approval' }), item('rentalProof', '租车合同、协议或完整订单', 'conditional', { condition: 'rental' }), item('lodging', '住宿发票及必要清单', 'conditional', { condition: 'lodging' }), item('meeting', '会议注册费发票及会议通知', 'conditional', { condition: 'meeting' }), item('training', '培训费发票及培训通知', 'conditional', { condition: 'training' }), pay(), item('explain', '情况说明', 'conditional', { condition: 'explain' })] },
  conference: { conditions: [{ id: 'international', label: '举办国际会议' }, { id: 'noSignIn', label: '特殊原因无法提供签到表' }, { id: 'service', label: '单笔服务金额达到相应门槛' }, { id: 'goods', label: '会议物品采购达到 2 万元' }], materials: [item('notice', '会议通知及议程'), item('approval', '会议审批表'), item('attendance', '参会签到表或人员名单', 'required', { note: '特殊原因无法签到时，名单应含单位和联系方式' }), item('invoice', '会议相关费用发票'), item('international', '外事办公室批复证明', 'conditional', { condition: 'international' }), pay(), item('serviceAcceptance', '服务项目验收单', 'conditional', { condition: 'service', minAmount: 10000 }), item('goodsAcceptance', '材料（办公用品）/图书验收单', 'conditional', { condition: 'goods', minAmount: 20000 }), item('contract', '合同原件', 'conditional', { condition: 'service', minAmount: 50000 })] },
  registration: { conditions: [], materials: [invoice('境外 invoice/receipt 的金额、币种、费用项等关键信息须译为中文'), item('notice', '会议通知与议程'), pay()] },
  publication: { conditions: [{ id: 'verticalFunding', label: '使用纵向科研经费卡' }], materials: [invoice('境外 invoice/receipt 的关键信息须译为中文'), item('acceptance', '论文发表通知或录用通知'), pay(), item('commitment', '承诺书', 'conditional', { condition: 'verticalFunding', maxAmount: 20000, note: '纵向科研经费卡 2 万元以下由论文作者签署' }), item('commitmentHigh', '承诺书及学院审批', 'conditional', { minAmount: 20000, note: '报销金额达到 2 万元时提供' })] },
  book: { conditions: [], materials: [invoice(), pay(), serviceAcceptance()] },
  printing: { conditions: [detailCondition], materials: [invoice(), detail(), pay(), serviceAcceptance(), contract()] },
  search: { conditions: [], materials: [invoice(), pay(), serviceAcceptance(), contract()] }
};

