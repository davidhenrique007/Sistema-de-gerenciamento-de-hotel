const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../config/database');
const Log = require('../../models/Log');

function formatarTempo(segundos) {
  if (!segundos || segundos <= 0) return '-';
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  if (horas > 0 && minutos > 0) return horas + 'h ' + minutos + 'min';
  if (horas > 0) return horas + 'h';
  if (minutos > 0) return minutos + 'min';
  return segundos + 's';
}

class UtilizadorController {
  async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        is_active
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const params = [];
      let paramIndex = 1;
      const conditions = [];

      let query = `
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.phone, 
          u.role, 
          u.is_active, 
          u.last_login, 
          u.last_logout,
          u.total_session_time,
          u.created_at,
          TO_CHAR(u.last_login, 'DD/MM/YYYY HH24:MI') as last_login_format,
          TO_CHAR(u.last_logout, 'DD/MM/YYYY HH24:MI') as last_logout_format
        FROM users u
        WHERE 1=1
      `;

      if (search) {
        conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (role) {
        conditions.push(`u.role = $${paramIndex}`);
        params.push(role);
        paramIndex++;
      }

      if (is_active !== undefined) {
        conditions.push(`u.is_active = $${paramIndex}`);
        params.push(is_active === 'true');
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const result = await db.query(query, params);
      const utilizadores = result.rows.map(u => ({
        ...u,
        last_login_formatted: u.last_login_format || '-',
        last_logout_formatted: u.last_logout_format || '-',
        session_time_formatted: formatarTempo(u.total_session_time)
      }));

      let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
      }
      const countParams = params.slice(0, -2);
      const totalResult = await db.query(countQuery, countParams);
      const total = parseInt(totalResult.rows[0]?.total || 0);

      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin,
          COUNT(CASE WHEN role = 'receptionist' THEN 1 END) as receptionist,
          COUNT(CASE WHEN role = 'financial' THEN 1 END) as financial
        FROM users
      `);

      return res.status(200).json({
        success: true,
        data: utilizadores,
        stats: stats.rows[0],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Erro ao listar utilizadores:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar utilizadores'
      });
    }
  }

  async criar(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { name, email, phone, role, password, is_active = true } = req.body;
      const usuarioLogado = req.user;

      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado no sistema'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password || 'Temp@123456', salt);
      const { v4: uuidv4 } = require('uuid');
      const userId = uuidv4();

      const result = await client.query(`
        INSERT INTO users (id, name, email, phone, role, password_hash, is_active, created_at, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING id, name, email, phone, role, is_active, created_at
      `, [userId, name, email, phone, role, password_hash, is_active, usuarioLogado.id]);

      await Log.registrar({
        usuarioId: usuarioLogado.id,
        usuarioNome: usuarioLogado.name,
        usuarioRole: usuarioLogado.role,
        acao: 'CREATE_USER',
        recurso: 'user',
        recursoId: result.rows[0].id,
        dadosNovos: { name, email, phone, role },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(201).json({
        success: true,
        message: 'Utilizador criado com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erro ao criar utilizador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao criar utilizador'
      });
    } finally {
      client.release();
    }
  }

  async atualizar(req, res) {
    const client = await db.pool.connect();
    
    try {
      const { id } = req.params;
      const { name, email, phone, role, is_active } = req.body;
      const usuarioLogado = req.user;

      const oldData = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      if (oldData.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      const oldUser = oldData.rows[0];

      if (oldUser.role === 'admin' && is_active === false) {
        const adminsAtivos = await client.query(
          'SELECT COUNT(*) as total FROM users WHERE role = $1 AND is_active = true AND id != $2',
          ['admin', id]
        );
        if (parseInt(adminsAtivos.rows[0].total) === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Não é possível desativar o último administrador ativo do sistema.'
          });
        }
      }

      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (name) {
        updates.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      if (email) {
        updates.push(`email = $${paramIndex++}`);
        params.push(email);
      }
      if (phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        params.push(phone);
      }
      if (role) {
        updates.push(`role = $${paramIndex++}`);
        params.push(role);
      }
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        params.push(is_active);
      }

      updates.push(`updated_at = NOW(), updated_by = $${paramIndex++}`);
      params.push(usuarioLogado.id);
      params.push(id);

      await client.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
      );

      await Log.registrar({
        usuarioId: usuarioLogado.id,
        usuarioNome: usuarioLogado.name,
        usuarioRole: usuarioLogado.role,
        acao: is_active === false ? 'DISABLE_USER' : (oldUser.is_active === false && is_active === true ? 'ENABLE_USER' : 'UPDATE_USER'),
        recurso: 'user',
        recursoId: id,
        dadosAntigos: { name: oldUser.name, email: oldUser.email, role: oldUser.role, is_active: oldUser.is_active },
        dadosNovos: { name, email, role, is_active },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Utilizador atualizado com sucesso'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao atualizar utilizador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao atualizar utilizador'
      });
    } finally {
      client.release();
    }
  }

  async resetarSenha(req, res) {
    try {
      const { id } = req.params;
      const usuarioLogado = req.user;

      const tempPassword = crypto.randomBytes(6).toString('hex').slice(0, 10);
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(tempPassword, salt);

      const user = await db.query(
        `UPDATE users 
         SET password_hash = $1, 
             must_change_password = true,
             updated_at = NOW()
         WHERE id = $2
         RETURNING name, email`,
        [password_hash, id]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      await Log.registrar({
        usuarioId: usuarioLogado.id,
        usuarioNome: usuarioLogado.name,
        usuarioRole: usuarioLogado.role,
        acao: 'RESET_PASSWORD',
        recurso: 'user',
        recursoId: id,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(200).json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao resetar senha'
      });
    }
  }

  async obter(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'SELECT id, name, email, phone, role, is_active, last_login, created_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao obter utilizador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao obter utilizador'
      });
    }
  }
}

module.exports = new UtilizadorController();
