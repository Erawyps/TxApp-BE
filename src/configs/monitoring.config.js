import { getDatabaseHealth } from '../configs/database.config.js';

// Configuration de monitoring pour la production
export const monitoringConfig = {
  // Intervalles de vérification (en millisecondes)
  intervals: {
    healthCheck: 30000,      // 30 secondes
    databaseCheck: 60000,    // 1 minute
    performanceCheck: 300000 // 5 minutes
  },

  // Seuils d'alerte
  thresholds: {
    responseTime: 5000,      // 5 secondes max
    memoryUsage: 0.8,        // 80% de la mémoire
    dbResponseTime: 1000,    // 1 seconde max pour la DB
    errorRate: 0.05          // 5% d'erreurs max
  },

  // URLs de notification (à configurer selon vos besoins)
  notifications: {
    webhook: process.env.MONITORING_WEBHOOK_URL,
    email: process.env.MONITORING_EMAIL
  }
};

// Classe de monitoring
export class ProductionMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      startTime: Date.now(),
      lastCheck: Date.now()
    };

    this.alerts = [];
    this.isMonitoring = false;
  }

  // Démarrer le monitoring
  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 Démarrage du monitoring de production...');

    // Health check périodique
    setInterval(() => {
      this.performHealthCheck();
    }, monitoringConfig.intervals.healthCheck);

    // Vérification base de données
    setInterval(() => {
      this.checkDatabase();
    }, monitoringConfig.intervals.databaseCheck);

    // Vérification des performances
    setInterval(() => {
      this.checkPerformance();
    }, monitoringConfig.intervals.performanceCheck);
  }

  // Arrêter le monitoring
  stop() {
    this.isMonitoring = false;
    console.log('🛑 Arrêt du monitoring');
  }

  // Enregistrer une requête
  recordRequest(success = true) {
    this.metrics.requests++;
    if (!success) {
      this.metrics.errors++;
    }
  }

  // Vérification de santé générale
  async performHealthCheck() {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryPercent = memoryUsage.heapUsed / memoryUsage.heapTotal;

      if (memoryPercent > monitoringConfig.thresholds.memoryUsage) {
        this.createAlert('HIGH_MEMORY_USAGE', `Utilisation mémoire: ${(memoryPercent * 100).toFixed(2)}%`);
      }

      const errorRate = this.metrics.errors / Math.max(this.metrics.requests, 1);
      if (errorRate > monitoringConfig.thresholds.errorRate) {
        this.createAlert('HIGH_ERROR_RATE', `Taux d'erreur: ${(errorRate * 100).toFixed(2)}%`);
      }

    } catch (error) {
      this.createAlert('HEALTH_CHECK_FAILED', error.message);
    }
  }

  // Vérification de la base de données
  async checkDatabase() {
    try {
      const startTime = Date.now();
      const health = await getDatabaseHealth();
      const responseTime = Date.now() - startTime;

      if (health.status !== 'healthy') {
        this.createAlert('DATABASE_UNHEALTHY', 'Base de données non accessible');
      }

      if (responseTime > monitoringConfig.thresholds.dbResponseTime) {
        this.createAlert('SLOW_DATABASE', `Temps de réponse DB: ${responseTime}ms`);
      }

    } catch (error) {
      this.createAlert('DATABASE_ERROR', error.message);
    }
  }

  // Vérification des performances
  checkPerformance() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    console.log(`📊 Performance - Uptime: ${Math.floor(uptime/60)}min, Mémoire: ${Math.round(memoryUsage.heapUsed/1024/1024)}MB`);

    // Reset des métriques toutes les heures
    if (Date.now() - this.metrics.lastCheck > 3600000) {
      this.resetMetrics();
    }
  }

  // Créer une alerte
  createAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    };

    this.alerts.push(alert);
    console.warn(`🚨 ALERTE ${alert.severity}: ${type} - ${message}`);

    // Limiter le nombre d'alertes stockées
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    }

    // Envoyer notification si configurée
    this.sendNotification(alert);
  }

  // Déterminer la sévérité d'une alerte
  getAlertSeverity(type) {
    const criticalAlerts = ['DATABASE_UNHEALTHY', 'HIGH_MEMORY_USAGE'];
    const warningAlerts = ['SLOW_DATABASE', 'HIGH_ERROR_RATE'];

    if (criticalAlerts.includes(type)) return 'CRITICAL';
    if (warningAlerts.includes(type)) return 'WARNING';
    return 'INFO';
  }

  // Envoyer une notification
  async sendNotification(alert) {
    if (alert.severity === 'INFO') return;

    try {
      // Webhook notification
      if (monitoringConfig.notifications.webhook) {
        await fetch(monitoringConfig.notifications.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 TxApp Alert: ${alert.type}`,
            attachments: [{
              color: alert.severity === 'CRITICAL' ? 'danger' : 'warning',
              fields: [{
                title: alert.type,
                value: alert.message,
                short: true
              }, {
                title: 'Timestamp',
                value: alert.timestamp,
                short: true
              }]
            }]
          })
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification:', error);
    }
  }

  // Reset des métriques
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      startTime: Date.now(),
      lastCheck: Date.now()
    };
    console.log('🔄 Métriques réinitialisées');
  }

  // Obtenir le statut du monitoring
  getStatus() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate = this.metrics.errors / Math.max(this.metrics.requests, 1);

    return {
      isMonitoring: this.isMonitoring,
      uptime: Math.floor(uptime / 1000),
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: (errorRate * 100).toFixed(2) + '%',
      recentAlerts: this.alerts.slice(-10),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

// Instance globale du monitor
export const monitor = new ProductionMonitor();

// Middleware Express pour le monitoring
export const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;

    monitor.recordRequest(success);

    if (responseTime > monitoringConfig.thresholds.responseTime) {
      monitor.createAlert('SLOW_RESPONSE', `Requête lente: ${req.path} - ${responseTime}ms`);
    }
  });

  next();
};
