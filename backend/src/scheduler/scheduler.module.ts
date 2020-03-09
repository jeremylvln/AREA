import { WorkflowsService } from "../workflows/workflows.service";
import { ModulesService } from "../modules/modules.service";
import { Logger, Module } from "@nestjs/common";
import { WorkflowsModule } from "workflows/workflows.module";
import { ModulesModule } from "modules/modules.module";

const INTERVAL = 1000 * 5;

@Module({
  imports: [WorkflowsModule, ModulesModule],
})
export class SchedulerModule {
  constructor(
    private readonly workflowService: WorkflowsService,
    private readonly moduleService: ModulesService
  ) {
    setInterval(async () => {
      Logger.log('Testing workflows', 'Scheduler', false);
      const rawWorkflows = (await this.workflowService.getWorkflows()).filter((workflow) =>
        workflow.enabled);

      const workflows = await Promise.all(rawWorkflows.map(async (rawWorkflow) => {
        const actions = await Promise.all(rawWorkflow.actions.map(async (rawAction) => {
          const action = this.moduleService.getActionById(rawAction.actionKind);
          const actionInstance = await action.getInstance(rawAction.actionId);
          return {
            action,
            actionInstance,
          };
        }));

        const reactions = await Promise.all(rawWorkflow.reactions.map(async (rawReaction) => {
          const reaction = this.moduleService.getReactionById(rawReaction.reactionKind);
          const reactionInstance = await reaction.getInstance(rawReaction.reactionId);
          return {
            reaction,
            reactionInstance,
          };
        }));

        return {
          id: rawWorkflow.id,
          name: rawWorkflow.name,
          actions,
          reactions,
        };
      }));

      const workflowsResults = await Promise.all(workflows.map(async (workflow) => {
        Logger.debug(`Testing workflow ${workflow.name} (${workflow.id})`, 'Scheduler', false);

        const actionResults = await Promise.all(workflow.actions.map(async (action) => {
          try {
            return {
              id: action.action.actionName,
              status: await action.action.test(action.actionInstance),
            };
          } catch (err) {
            Logger.error('Failed to test an action', err, 'Scheduler', false);
            return {
              id: action.action.actionName,
              status: 'errored',
            };
          }
        }));

        let reactionResults = null;

        if (actionResults.find((res) => res.status === true)) {
          Logger.debug(`Executing reactions of workflow ${workflow.name} (${workflow.id})`, 'Scheduler');
          const reactions = workflow.reactions;

          reactionResults = await Promise.all(reactions.map(async (reaction) => {
            try {
              return {
                id: reaction.reaction.reactionName,
                status: await reaction.reaction.apply(reaction.reactionInstance),
              };
            } catch (err) {
              Logger.error('Failed to test an action', err, 'Scheduler', false)
              return {
                id: reaction.reaction.reactionName,
                status: 'errored',
              };
            }
          }));
        }

        return {
          name: workflow.name,
          actionResults,
          reactionResults,
        };
      }));

      if (workflowsResults.length > 0) {
        Logger.log('Results of workflow execution:', 'Scheduler', false);
        workflowsResults.forEach((res) => {
          Logger.log(res.name, 'Scheduler', false);

          let i = 0;

          Logger.log(`${res.reactionResults ? '├' : '└'} Actions`, 'Scheduler', false);
          res.actionResults.forEach((actionRes) => {
            Logger.log(`${res.reactionResults ? '│' : ' '}  ${i == res.actionResults.length - 1 ? '└' : '├'} ${actionRes.id}: ${actionRes.status}`, 'Scheduler', false);
            i++;
          });

          if (res.reactionResults) {
            i = 0;

            Logger.log('└ Reactions', 'Scheduler', false);
            res.reactionResults.forEach((reactionRes) => {
              Logger.log(`   ${i == res.reactionResults.length - 1 ? '└' : '├'} ${reactionRes.id}: ${reactionRes.status}`, 'Scheduler', false);
              i++;
            });
          }
        });
      }

      Logger.log('Done', 'Scheduler');
    }, INTERVAL);
  }
}
