export type Transaction = {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
  type: 'income' | 'expense'
  recurring?: boolean
}

export type Goal = { id: string; name: string; target: number; saved: number; due: string; color: 'green' | 'blue' | 'orange' }
export type PlannedEvent = { id: string; date: string; label: string; amount: number; type: 'income' | 'expense'; confidence: 'expected' | 'planned' | 'projected' }
export type FinanceState = { balance: number; monthlyIncome: number; transactions: Transaction[]; goals: Goal[]; events: PlannedEvent[] }

export const demoState: FinanceState = {
  balance: 84250, monthlyIncome: 128000,
  transactions: [
    { id:'t1', date:'2026-08-20', merchant:'Salary — August', category:'Income', amount:128000, type:'income', recurring:true },
    { id:'t2', date:'2026-08-18', merchant:'Rent payment', category:'Housing', amount:32000, type:'expense', recurring:true },
    { id:'t3', date:'2026-08-16', merchant:'Amazon India', category:'Shopping', amount:2499, type:'expense' },
    { id:'t4', date:'2026-08-15', merchant:'Zomato', category:'Food & dining', amount:680, type:'expense' },
    { id:'t5', date:'2026-08-12', merchant:'SBI Life Insurance', category:'Insurance', amount:4200, type:'expense', recurring:true },
    { id:'t6', date:'2026-08-10', merchant:'Netflix', category:'Subscriptions', amount:649, type:'expense', recurring:true },
    { id:'t7', date:'2026-08-07', merchant:'Electricity bill', category:'Utilities', amount:1840, type:'expense', recurring:true },
    { id:'t8', date:'2026-08-03', merchant:'Mutual fund SIP', category:'Investments', amount:15000, type:'expense', recurring:true },
  ],
  goals: [
    { id:'g1', name:'Emergency fund', target:300000, saved:180000, due:'Dec 2026', color:'green' },
    { id:'g2', name:'Goa trip', target:60000, saved:38000, due:'Oct 2026', color:'blue' },
    { id:'g3', name:'New laptop', target:100000, saved:24000, due:'Feb 2027', color:'orange' },
  ],
  events: [
    { id:'e1', date:'2026-08-28', label:'Credit card payment', amount:8400, type:'expense', confidence:'expected' },
    { id:'e2', date:'2026-09-01', label:'Rent payment', amount:32000, type:'expense', confidence:'expected' },
    { id:'e3', date:'2026-09-01', label:'Salary', amount:128000, type:'income', confidence:'expected' },
    { id:'e4', date:'2026-09-05', label:'Mutual fund SIP', amount:15000, type:'expense', confidence:'planned' },
  ]
}

export const inr = (n:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n)
export function metrics(state: FinanceState) {
  const expenses = state.transactions.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0)
  const commitments = state.transactions.filter(t=>t.type==='expense'&&t.recurring).reduce((a,t)=>a+t.amount,0)
  const variableExpenses = Math.max(0, expenses - commitments)
  const safe = Math.max(0, state.balance - commitments - variableExpenses - 25000)
  const health = commitments === 0 ? 100 : Math.min(100, Math.round((state.balance/(commitments*3))*100))
  return { expenses, commitments, variableExpenses, safe, health, healthBreakdown: { savings: 18, cashFlow: 14, buffer: 10, commitments: 6, stability: 4, goals: 0 } }
}
export function projected(state:FinanceState, days:number) {
  const start = new Date('2026-08-22T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  const eventNet = state.events.filter(event => {
    const date = new Date(`${event.date}T00:00:00`)
    return date > start && date <= end
  }).reduce((total, event) => total + (event.type === 'income' ? event.amount : -event.amount), 0)
  const monthlyNet = state.monthlyIncome - metrics(state).expenses
  return Math.round(state.balance + eventNet + (monthlyNet * days) / 30)
}
