# DevPulse AI — Privacy by Design e Segurança

## 1. Premissa

O DevPulse AI lida com dados sensíveis de engenharia: metadados de código, fluxo de trabalho, usuários, revisões e produtividade. Por isso, privacidade e segurança devem ser parte do desenho do produto desde o início.

## 2. Dados coletados

### Dados necessários no MVP

- metadados de repositórios;
- metadados de pull requests;
- metadados de reviews;
- metadados de commits;
- metadados de workflows;
- metadados de deployments;
- usuários GitHub associados;
- labels;
- timestamps;
- dados declarativos de uso de IA.

### Dados opcionais e desabilitados por padrão

- body de PR;
- body de review;
- body de issue;
- mensagens completas de commit;
- comentários livres;
- respostas identificadas de survey.

## 3. Configurações padrão de privacidade

```text
collect_pr_body=false
collect_review_body=false
collect_commit_messages=false
collect_issue_body=false
anonymize_surveys=true
show_individual_metrics=false
data_retention_days=null
```

## 4. Política anti-ranking

O produto não deve criar ranking público de desenvolvedores.

Permitido:

- métricas por squad;
- métricas por repositório;
- métricas individuais privadas para coaching;
- análise de carga de review quando necessária para gestão de fluxo.

Evitar:

- ranking de commits;
- ranking de linhas de código;
- ranking de PRs;
- score individual público;
- comparações simplistas entre devs.

## 5. RBAC

### Papéis

- INSTANCE_ADMIN
- ORG_ADMIN
- ENGINEERING_MANAGER
- TECH_LEAD
- DEVELOPER
- EXECUTIVE_VIEWER

### Regras iniciais

- INSTANCE_ADMIN gerencia instância.
- ORG_ADMIN gerencia organização e integrações.
- ENGINEERING_MANAGER vê métricas dos squads permitidos.
- TECH_LEAD vê detalhes técnicos dos squads permitidos.
- DEVELOPER vê próprios PRs, squads e dados agregados permitidos.
- EXECUTIVE_VIEWER vê dashboards agregados, sem drill-down sensível.

## 6. Segurança da integração GitHub

- Usar GitHub App.
- Escopos mínimos.
- Validar assinatura de webhooks.
- Não armazenar installation token permanente.
- Gerar installation token sob demanda.
- Proteger private key do GitHub App via env secret.
- Registrar instalação e permissões.
- Permitir revogação.
- Não logar payloads sensíveis completos.

## 7. Criptografia

### Em trânsito

- HTTPS obrigatório em produção.

### Em repouso

- Banco protegido pelo provedor/self-hosted.
- Secrets fora do banco sempre que possível.
- Quando necessário armazenar tokens, criptografar com `ENCRYPTION_KEY`.

## 8. Logs

Não logar:

- tokens;
- private keys;
- bodies de PR/review se desabilitados;
- cookies;
- senhas;
- payloads completos sensíveis.

Logar:

- job id;
- provider;
- status;
- duração;
- erro sanitizado;
- organização;
- repositório;
- evento;
- correlation id.

## 9. Auditoria

Gerar audit log para:

- login;
- alteração de permissões;
- instalação/desconexão GitHub;
- alteração de privacy settings;
- alteração de data retention;
- exportação de dados;
- exclusão/anonimização de usuário;
- criação/alteração de automações.

## 10. Retenção de dados

A organização deve configurar retenção.

Opções:

- sem expiração;
- 90 dias;
- 180 dias;
- 365 dias;
- customizada.

Aplicar retenção principalmente em:

- eventos brutos;
- logs;
- payloads;
- dados pessoais;
- surveys.

Métricas agregadas podem ter retenção maior, desde que minimizadas.

## 11. Exclusão e anonimização

O produto deve permitir:

- desativar usuário;
- anonimizar usuário;
- remover associação com GitHub login;
- manter métricas agregadas sem identificação pessoal;
- excluir respostas de survey identificadas.

## 12. Segurança de aplicação

- validação de input com Zod;
- proteção contra SQL injection via ORM;
- CORS restritivo;
- cookies HttpOnly/Secure/SameSite;
- rate limit;
- headers de segurança;
- CSRF conforme estratégia de sessão;
- controle de upload inexistente no MVP;
- tratamento seguro de erros;
- dependências mínimas.

## 13. Checklist de threat modeling inicial

- Alguém pode instalar GitHub App em org errada?
- Alguém pode acessar dados de squad sem permissão?
- Webhook falso pode injetar dados?
- Logs podem vazar tokens?
- Métricas individuais podem ser usadas de forma indevida?
- Dados de PR body estão sendo coletados sem necessidade?
- Usuário externo consegue enumerar IDs?
- Jobs podem processar dados de outra organização?
- Exportação respeita RBAC?
- Surveys anônimos são realmente anônimos?

## 14. Documentação de privacidade para usuários

O produto deve ter uma página explicando:

- quais dados são coletados;
- por que são coletados;
- como são usados;
- quem pode ver;
- como desabilitar dados sensíveis;
- como configurar retenção;
- como anonimizar;
- como excluir;
- por que não há ranking público.

