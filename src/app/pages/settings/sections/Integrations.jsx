// Import Dependencies
import { useState } from "react";
import { CloudIcon, WrenchScrewdriverIcon, LinkIcon, KeyIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Local Imports
import { Card, Button, Input, Switch } from "components/ui";

// ----------------------------------------------------------------------

export default function Integrations() {
  const [isLoading, setIsLoading] = useState(false);
  const [integrations, setIntegrations] = useState({
    stripe: {
      enabled: false,
      apiKey: "",
      webhookSecret: "",
      connected: false,
    },
    paypal: {
      enabled: false,
      clientId: "",
      clientSecret: "",
      connected: false,
    },
    googleMaps: {
      enabled: true,
      apiKey: "AIzaSyB...",
      connected: true,
    },
    twilio: {
      enabled: false,
      accountSid: "",
      authToken: "",
      phoneNumber: "",
      connected: false,
    },
    sendgrid: {
      enabled: false,
      apiKey: "",
      connected: false,
    },
    slack: {
      enabled: false,
      webhookUrl: "",
      connected: false,
    },
  });

  const handleIntegrationToggle = async (service, enabled) => {
    setIsLoading(true);
    try {
      // TODO: Implement integration toggle logic
      setIntegrations(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          enabled,
        },
      }));
      toast.success(`${service} ${enabled ? 'activé' : 'désactivé'}`);
    } catch {
      toast.error(`Erreur lors de ${enabled ? 'l\'activation' : 'la désactivation'} de ${service}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectIntegration = async (service) => {
    setIsLoading(true);
    try {
      // TODO: Implement OAuth/connection logic
      setIntegrations(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          connected: true,
        },
      }));
      toast.success(`${service} connecté avec succès`);
    } catch {
      toast.error(`Erreur lors de la connexion à ${service}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectIntegration = async (service) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${service} ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement disconnect logic
      setIntegrations(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          connected: false,
          enabled: false,
        },
      }));
      toast.success(`${service} déconnecté`);
    } catch {
      toast.error(`Erreur lors de la déconnexion de ${service}`);
    } finally {
      setIsLoading(false);
    }
  };

  const IntegrationCard = ({ service, config, icon: Icon, description, category }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            config.connected
              ? 'bg-green-100 dark:bg-green-900/20'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <Icon className={`h-5 w-5 ${
              config.connected
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {service.charAt(0).toUpperCase() + service.slice(1)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {category}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {config.connected && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Connecté
            </span>
          )}
          <Switch
            checked={config.enabled}
            onChange={(checked) => handleIntegrationToggle(service, checked)}
            disabled={isLoading || !config.connected}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      {/* Configuration fields */}
      {config.connected && (
        <div className="space-y-3 mb-4">
          {service === 'stripe' && (
            <>
              <Input
                label="Clé API Stripe"
                type="password"
                value={config.apiKey}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  stripe: { ...prev.stripe, apiKey: e.target.value }
                }))}
                placeholder="sk_test_..."
              />
              <Input
                label="Secret Webhook"
                type="password"
                value={config.webhookSecret}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  stripe: { ...prev.stripe, webhookSecret: e.target.value }
                }))}
                placeholder="whsec_..."
              />
            </>
          )}

          {service === 'paypal' && (
            <>
              <Input
                label="Client ID"
                type="password"
                value={config.clientId}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  paypal: { ...prev.paypal, clientId: e.target.value }
                }))}
                placeholder="AZ..."
              />
              <Input
                label="Client Secret"
                type="password"
                value={config.clientSecret}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  paypal: { ...prev.paypal, clientSecret: e.target.value }
                }))}
                placeholder="EP..."
              />
            </>
          )}

          {service === 'googleMaps' && (
            <Input
              label="Clé API Google Maps"
              type="password"
              value={config.apiKey}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                googleMaps: { ...prev.googleMaps, apiKey: e.target.value }
              }))}
              placeholder="AIza..."
            />
          )}

          {service === 'twilio' && (
            <>
              <Input
                label="Account SID"
                type="password"
                value={config.accountSid}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  twilio: { ...prev.twilio, accountSid: e.target.value }
                }))}
                placeholder="AC..."
              />
              <Input
                label="Auth Token"
                type="password"
                value={config.authToken}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  twilio: { ...prev.twilio, authToken: e.target.value }
                }))}
                placeholder="SK..."
              />
              <Input
                label="Numéro de téléphone"
                value={config.phoneNumber}
                onChange={(e) => setIntegrations(prev => ({
                  ...prev,
                  twilio: { ...prev.twilio, phoneNumber: e.target.value }
                }))}
                placeholder="+32..."
              />
            </>
          )}

          {service === 'sendgrid' && (
            <Input
              label="Clé API SendGrid"
              type="password"
              value={config.apiKey}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                sendgrid: { ...prev.sendgrid, apiKey: e.target.value }
              }))}
              placeholder="SG..."
            />
          )}

          {service === 'slack' && (
            <Input
              label="Webhook URL"
              type="password"
              value={config.webhookUrl}
              onChange={(e) => setIntegrations(prev => ({
                ...prev,
                slack: { ...prev.slack, webhookUrl: e.target.value }
              }))}
              placeholder="https://hooks.slack.com/..."
            />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        {config.connected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDisconnectIntegration(service)}
              disabled={isLoading}
            >
              Déconnecter
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success(`Configuration de ${service} sauvegardée`)}
              disabled={isLoading}
            >
              Sauvegarder
            </Button>
          </>
        ) : (
          <Button
            onClick={() => handleConnectIntegration(service)}
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Connecter"}
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div>
        <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
          Intégrations &amp; APIs
        </h5>
        <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
          Connectez des services externes pour étendre les fonctionnalités de votre application.
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-dark-500" />

      {/* Services de paiement */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <KeyIcon className="h-4 w-4 mr-2" />
          Services de paiement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IntegrationCard
            service="stripe"
            config={integrations.stripe}
            icon={WrenchScrewdriverIcon}
            description="Traitez les paiements par carte bancaire en toute sécurité"
            category="Paiement"
          />
          <IntegrationCard
            service="paypal"
            config={integrations.paypal}
            icon={WrenchScrewdriverIcon}
            description="Acceptez les paiements PayPal et les cartes bancaires"
            category="Paiement"
          />
        </div>
      </div>

      {/* Services de cartographie */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <CloudIcon className="h-4 w-4 mr-2" />
          Services de cartographie
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IntegrationCard
            service="googleMaps"
            config={integrations.googleMaps}
            icon={CloudIcon}
            description="Intégrez des cartes interactives et le calcul d'itinéraires"
            category="Cartes"
          />
        </div>
      </div>

      {/* Communication */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <LinkIcon className="h-4 w-4 mr-2" />
          Communication
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IntegrationCard
            service="twilio"
            config={integrations.twilio}
            icon={LinkIcon}
            description="Envoyez des SMS et gérez les appels téléphoniques"
            category="Communication"
          />
          <IntegrationCard
            service="sendgrid"
            config={integrations.sendgrid}
            icon={LinkIcon}
            description="Envoyez des emails transactionnels et marketing"
            category="Communication"
          />
          <IntegrationCard
            service="slack"
            config={integrations.slack}
            icon={LinkIcon}
            description="Recevez des notifications dans vos canaux Slack"
            category="Communication"
          />
        </div>
      </div>

      {/* Statut des intégrations */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Statut des intégrations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Connectées</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              {Object.values(integrations).filter(i => i.connected).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Activées</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {Object.values(integrations).filter(i => i.enabled).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Paiement</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {Object.entries(integrations).filter(([k, v]) => ['stripe', 'paypal'].includes(k) && v.connected).length}/2
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Communication</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {Object.entries(integrations).filter(([k, v]) => ['twilio', 'sendgrid', 'slack'].includes(k) && v.connected).length}/3
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}