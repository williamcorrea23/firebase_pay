import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  where,
  runTransaction
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwNC4QWaBQYqvayl98oMArcGdYV0JuqSk",
  authDomain: "elearning-568mbq.firebaseapp.com",
  projectId: "elearning-568mbq",
  storageBucket: "elearning-568mbq.appspot.com",
  messagingSenderId: "956581108104",
  appId: "1:956581108104:web:2be9a9b0c5978cd4b3823d",
  measurementId: "G-WLB4FBXE9R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Melhorada a função de tratamento de erro para incluir logs e lançar um erro personalizado
function handleError(error, customMessage) {
  console.error(`${customMessage}: ${error.message}`);
  // Loga o erro completo para debugging
  console.error(error);
  // Lança um erro personalizado para melhor tratamento upstream
  throw new Error(`${customMessage}: ${error.message}`);
}

// Funções de Autenticação
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuário registrado com sucesso:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    handleError(error, 'Erro ao registrar usuário');
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuário logado com sucesso:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    handleError(error, 'Erro ao fazer login');
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    console.log('Usuário deslogado com sucesso');
  } catch (error) {
    handleError(error, 'Erro ao fazer logout');
  }
}

// Funções CRUD para Produtos
async function addProduct(productData) {
  try {
    // Validação básica dos dados do produto
    if (!productData.name || !productData.price) {
      throw new Error('Nome e preço do produto são obrigatórios');
    }
    const docRef = await addDoc(collection(db, 'Productos'), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Produto adicionado com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    handleError(error, 'Erro ao adicionar produto');
  }
}

async function getProduct(productId) {
  try {
    const docRef = doc(db, 'Productos', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log('Produto não encontrado');
      return null;
    }
  } catch (error) {
    handleError(error, 'Erro ao buscar produto');
  }
}

async function updateProduct(productId, updateData) {
  try {
    const docRef = doc(db, 'Productos', productId);
    // Usa uma transação para garantir a atomicidade da operação
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) {
        throw new Error('O produto não existe');
      }
      transaction.update(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
    });
    console.log('Produto atualizado com sucesso');
  } catch (error) {
    handleError(error, 'Erro ao atualizar produto');
  }
}

async function deleteProduct(productId) {
  try {
    const docRef = doc(db, 'Productos', productId);
    await deleteDoc(docRef);
    console.log('Produto deletado com sucesso');
  } catch (error) {
    handleError(error, 'Erro ao deletar produto');
  }
}

async function getAllProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'Productos'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleError(error, 'Erro ao buscar todos os produtos');
  }
}

async function getActiveProducts() {
  try {
    const q = query(collection(db, 'Productos'), where("active", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleError(error, 'Erro ao buscar produtos ativos');
  }
}

// Função principal para demonstração
async function main() {
  try {
    // Registro de usuário
    const newUser = await registerUser('novousuario@example.com', 'senhaSegura123');
    if (!newUser) throw new Error('Falha ao registrar usuário');

    // Login
    const loggedUser = await loginUser('novousuario@example.com', 'senhaSegura123');
    if (!loggedUser) throw new Error('Falha ao fazer login');

    // Adicionar um produto
    const newProductId = await addProduct({
      name: 'Novo Produto',
      description: 'Descrição do novo produto',
      price: 99.99,
      active: true
    });
    if (!newProductId) throw new Error('Falha ao adicionar produto');

    // Buscar o produto adicionado
    const product = await getProduct(newProductId);
    if (!product) throw new Error('Produto não encontrado');
    console.log('Produto buscado:', product);

    // Atualizar o produto
    await updateProduct(newProductId, { price: 89.99 });

    // Buscar todos os produtos
    const allProducts = await getAllProducts();
    console.log('Todos os produtos:', allProducts);

    // Buscar produtos ativos
    const activeProducts = await getActiveProducts();
    console.log('Produtos ativos:', activeProducts);

    // Deletar o produto
    await deleteProduct(newProductId);

    // Logout
    await logoutUser();

  } catch (error) {
    console.error('Erro na execução principal:', error.message);
  }
}

// Listener para mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuário está logado:', user.uid);
  } else {
    console.log('Usuário não está logado');
  }
});

// Executar a função principal
main();
