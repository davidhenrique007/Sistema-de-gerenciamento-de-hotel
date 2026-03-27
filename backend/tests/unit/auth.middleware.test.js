// =====================================================
// HOTEL PARADISE - AUTH MIDDLEWARE TESTS
// Versão: 2.0.0 (Corrigida)
// =====================================================

const jwt = require('jsonwebtoken');
const { authenticate, authorize } = require('../../middlewares/auth');

// Mock do jwt
jest.mock('jsonwebtoken');

// Mock dos models com db incluso para auditoria
jest.mock('../../models', () => ({
  models: {
    users: {
      findById: jest.fn()
    }
  },
  db: {
    raw: jest.fn().mockResolvedValue({})
  }
}));

const { models, db } = require('../../models');

// Mensagens padronizadas para evitar problemas de encoding
const MESSAGES = {
  NO_TOKEN: 'Token não fornecido',
  INVALID_TOKEN: 'Token inválido',
  USER_NOT_FOUND: 'Usuário não encontrado',
  USER_INACTIVE: 'Usuário inativo',
  NOT_AUTHENTICATED: 'Usuário não autenticado',
  ACCESS_DENIED: 'Acesso negado. Permissão insuficiente.'
};

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
    
    // Mock do setCurrentUser para evitar erros de db.raw
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authenticate', () => {
    test('deve retornar 401 se não houver token', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.NO_TOKEN
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 se token for inválido', async () => {
      req.headers.authorization = 'Bearer token_invalido';
      
      jwt.verify.mockImplementationOnce(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.INVALID_TOKEN
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 se token expirou', async () => {
      req.headers.authorization = 'Bearer token_expirado';
      
      jwt.verify.mockImplementationOnce(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expirado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 se usuário não for encontrado', async () => {
      req.headers.authorization = 'Bearer token_valido';
      jwt.verify.mockReturnValue({ id: '123' });
      models.users.findById.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 401 se usuário estiver inativo', async () => {
      req.headers.authorization = 'Bearer token_valido';
      jwt.verify.mockReturnValue({ id: '123' });
      models.users.findById.mockResolvedValue({ 
        id: '123', 
        is_active: false,
        password_hash: 'hash',
        name: 'Test User'
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.USER_INACTIVE
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve chamar next() se tudo estiver ok e configurar usuário', async () => {
      req.headers.authorization = 'Bearer token_valido';
      const mockUser = { 
        id: '123', 
        is_active: true,
        password_hash: 'hash',
        name: 'Test User',
        email: 'test@test.com',
        role: 'admin'
      };
      
      jwt.verify.mockReturnValue({ id: '123' });
      models.users.findById.mockResolvedValue(mockUser);
      db.raw.mockResolvedValue({});

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.password_hash).toBeUndefined();
      expect(req.user.id).toBe('123');
      expect(db.raw).toHaveBeenCalledWith(expect.stringContaining('SET app.current_user_id'));
    });
  });

  describe('authorize', () => {
    test('deve retornar 401 se usuário não estiver autenticado', () => {
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.NOT_AUTHENTICATED
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve retornar 403 se perfil não for permitido', () => {
      req.user = { role: 'receptionist' };
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: MESSAGES.ACCESS_DENIED
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('deve chamar next() se perfil for permitido (único perfil)', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve chamar next() se perfil for permitido (múltiplos perfis)', () => {
      req.user = { role: 'receptionist' };
      const middleware = authorize('admin', 'receptionist', 'financial');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve chamar next() para perfil financial', () => {
      req.user = { role: 'financial' };
      const middleware = authorize('admin', 'receptionist', 'financial');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('casos de erro no servidor', () => {
    test('deve retornar 500 se jwt.verify lançar erro inesperado', async () => {
      req.headers.authorization = 'Bearer token_valido';
      
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Erro inesperado');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro interno no servidor'
      });
    });

    test('deve retornar 500 se models.users.findById lançar erro', async () => {
      req.headers.authorization = 'Bearer token_valido';
      jwt.verify.mockReturnValue({ id: '123' });
      models.users.findById.mockRejectedValue(new Error('DB Error'));

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro interno no servidor'
      });
    });
  });
});