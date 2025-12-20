import { openDB, IDBPDatabase } from 'idb'
import type { Sale, Expense, Customer, Service, ExpenseCategory, Supplier, Employee } from '@/types/database'

interface SyncQueueItem {
  id: string
  tableName: string
  recordId: string
  action: 'insert' | 'update' | 'delete'
  data: Record<string, unknown>
  createdAt: string
}

type SaleWithSync = Sale & { _synced?: boolean }
type ExpenseWithSync = Expense & { _synced?: boolean }

const DB_NAME = 'gaia-accounting'
const DB_VERSION = 1

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: IDBPDatabase<any> | null = null

export async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sales store
      if (!db.objectStoreNames.contains('sales')) {
        const salesStore = db.createObjectStore('sales', { keyPath: 'id' })
        salesStore.createIndex('by-date', 'sale_date')
        salesStore.createIndex('by-synced', '_synced')
      }

      // Expenses store
      if (!db.objectStoreNames.contains('expenses')) {
        const expensesStore = db.createObjectStore('expenses', { keyPath: 'id' })
        expensesStore.createIndex('by-date', 'expense_date')
        expensesStore.createIndex('by-synced', '_synced')
      }

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customersStore = db.createObjectStore('customers', { keyPath: 'id' })
        customersStore.createIndex('by-name', 'name')
      }

      // Services store
      if (!db.objectStoreNames.contains('services')) {
        db.createObjectStore('services', { keyPath: 'id' })
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' })
      }

      // Suppliers store
      if (!db.objectStoreNames.contains('suppliers')) {
        db.createObjectStore('suppliers', { keyPath: 'id' })
      }

      // Employees store
      if (!db.objectStoreNames.contains('employees')) {
        db.createObjectStore('employees', { keyPath: 'id' })
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
        syncStore.createIndex('by-created', 'createdAt')
      }
    },
  })

  return dbInstance
}

// Sales operations
export async function getAllSales(): Promise<SaleWithSync[]> {
  const db = await getDB()
  return db.getAll('sales')
}

export async function getSaleById(id: string): Promise<SaleWithSync | undefined> {
  const db = await getDB()
  return db.get('sales', id)
}

export async function putSale(sale: SaleWithSync): Promise<string> {
  const db = await getDB()
  return db.put('sales', sale)
}

export async function deleteSale(id: string): Promise<void> {
  const db = await getDB()
  return db.delete('sales', id)
}

// Expenses operations
export async function getAllExpenses(): Promise<ExpenseWithSync[]> {
  const db = await getDB()
  return db.getAll('expenses')
}

export async function getExpenseById(id: string): Promise<ExpenseWithSync | undefined> {
  const db = await getDB()
  return db.get('expenses', id)
}

export async function putExpense(expense: ExpenseWithSync): Promise<string> {
  const db = await getDB()
  return db.put('expenses', expense)
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB()
  return db.delete('expenses', id)
}

// Customers operations
export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDB()
  return db.getAll('customers')
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const db = await getDB()
  return db.get('customers', id)
}

export async function putCustomer(customer: Customer): Promise<string> {
  const db = await getDB()
  return db.put('customers', customer)
}

// Services operations
export async function getAllServices(): Promise<Service[]> {
  const db = await getDB()
  return db.getAll('services')
}

export async function putServices(services: Service[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('services', 'readwrite')
  await Promise.all([
    ...services.map((service) => tx.store.put(service)),
    tx.done,
  ])
}

// Categories operations
export async function getAllCategories(): Promise<ExpenseCategory[]> {
  const db = await getDB()
  return db.getAll('categories')
}

export async function putCategories(categories: ExpenseCategory[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('categories', 'readwrite')
  await Promise.all([
    ...categories.map((category) => tx.store.put(category)),
    tx.done,
  ])
}

// Suppliers operations
export async function getAllSuppliers(): Promise<Supplier[]> {
  const db = await getDB()
  return db.getAll('suppliers')
}

export async function putSuppliers(suppliers: Supplier[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('suppliers', 'readwrite')
  await Promise.all([
    ...suppliers.map((supplier) => tx.store.put(supplier)),
    tx.done,
  ])
}

// Employees operations
export async function getAllEmployees(): Promise<Employee[]> {
  const db = await getDB()
  return db.getAll('employees')
}

export async function putEmployees(employees: Employee[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('employees', 'readwrite')
  await Promise.all([
    ...employees.map((employee) => tx.store.put(employee)),
    tx.done,
  ])
}

// Sync queue operations
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<void> {
  const db = await getDB()
  const queueItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  await db.put('syncQueue', queueItem)
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return db.getAllFromIndex('syncQueue', 'by-created')
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB()
  await db.clear('syncQueue')
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('syncQueue', id)
}

// Clear all data
export async function clearAllStores(): Promise<void> {
  const db = await getDB()
  const stores = ['sales', 'expenses', 'customers', 'services', 'categories', 'suppliers', 'employees', 'syncQueue']
  await Promise.all(stores.map((store) => db.clear(store)))
}
