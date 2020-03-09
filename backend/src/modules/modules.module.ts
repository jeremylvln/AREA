import { Module, forwardRef } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { CronAction } from './actions/cron.action';
import { MinecraftPlayersAction } from './actions/minecraft.players.action';
import { TimeDateAction } from './actions/time.date.action';
import { TimeHourAction } from './actions/time.hour.action';
import { WeatherTemperatureAction } from './actions/weather.temperature.action';
import { WeatherKindAction } from './actions/weather.kind.action';
import { MinecraftCommandReaction } from './reactions/minecraft.command.reaction';
import { GitHubWatchersAction } from './actions/github.watchers.action';
import { GitHubStarsAction } from './actions/github.stars.action';
import { GitHubForksAction } from './actions/github.forks.action';
import { TwitterFollowersAction } from './actions/twitter.followers.action';
import { TwitterNewFollowerAction } from './actions/twitter.new.follower.action';
import { TwitterMentionAction } from './actions/twitter.mention.action';
import { TwitterDMAction } from './actions/twitter.dm.action';
import { TwitterSendDMReaction } from './reactions/twitter.send.dm.reaction';
import { TwitterSendTweetReaction } from './reactions/twitter.send.tweet.reaction';
import { TwitterRespondTweetReaction } from './reactions/twitter.respond.tweet.reaction';
import { OutlookMailAction } from './actions/outlook.mail.action';
import { EpitechGradeAction } from './actions/epitech.grade.action';
import { OutlookSendMailReaction } from './reactions/outlook.send.mail.reaction';
import { EpitechRankAction } from './actions/epitech.rank.action';
import { TwilioSendSMSReaction } from './reactions/twilio.send.sms.reaction';
import { SSHCommandReaction } from './reactions/ssh.command.reaction';
import { SlackSendMessageReaction } from './reactions/slack.send.message.reaction';
import { TodoNewTaskAction } from './actions/todo.new.task.action';
import { TodoCompleteTaskAction } from './actions/todo.complete.task.action';
import { TodoCreateTaskReaction } from './reactions/todo.create.task.reaction';
import { TwitchStreamStateAction } from './actions/twitch.stream.state.action';
import { YouTubeNewVideoAction } from './actions/youtube.new.video.action';
import { SSHCommandAction } from './actions/ssh.command.action';
import { WebsiteDownAction } from './actions/website.down.action';
import { RedtubeNewVideoAction } from './actions/redtube.new.video.action';
import { StockStockChangeAction } from './actions/stock.stock.change.action';
import { StockForexChangeAction } from './actions/stock.forex.change.action';
import { StockCryptoChangeAction } from './actions/stock.crypto.change.action';

@Module({
  imports: [
    forwardRef(() => CronAction),
    forwardRef(() => MinecraftPlayersAction),
    forwardRef(() => TimeDateAction),
    forwardRef(() => TimeHourAction),
    forwardRef(() => WeatherKindAction),
    forwardRef(() => WeatherTemperatureAction),
    forwardRef(() => GitHubWatchersAction),
    forwardRef(() => GitHubStarsAction),
    forwardRef(() => GitHubForksAction),
    forwardRef(() => TwitterFollowersAction),
    forwardRef(() => TwitterNewFollowerAction),
    forwardRef(() => TwitterMentionAction),
    forwardRef(() => TwitterDMAction),
    forwardRef(() => OutlookMailAction),
    forwardRef(() => EpitechGradeAction),
    forwardRef(() => EpitechRankAction),
    forwardRef(() => TodoNewTaskAction),
    forwardRef(() => TodoCompleteTaskAction),
    forwardRef(() => TwitchStreamStateAction),
    forwardRef(() => YouTubeNewVideoAction),
    forwardRef(() => SSHCommandAction),
    forwardRef(() => WebsiteDownAction),
    forwardRef(() => RedtubeNewVideoAction),
    forwardRef(() => StockStockChangeAction),
    forwardRef(() => StockForexChangeAction),
    forwardRef(() => StockCryptoChangeAction),

    forwardRef(() => MinecraftCommandReaction),
    forwardRef(() => TwitterSendDMReaction),
    forwardRef(() => TwitterSendTweetReaction),
    forwardRef(() => TwitterRespondTweetReaction),
    forwardRef(() => OutlookSendMailReaction),
    forwardRef(() => TwilioSendSMSReaction),
    forwardRef(() => SSHCommandReaction),
    forwardRef(() => SlackSendMessageReaction),
    forwardRef(() => TodoCreateTaskReaction),
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
