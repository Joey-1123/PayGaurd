package expo.modules.payguard.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

/**
 * Receives SMS_RECEIVED broadcasts and forwards them to the JS event bus.
 * Requires a native build — does not work in Expo Go.
 */
class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        if (messages.isEmpty()) return
        val sender = messages.first().originatingAddress ?: "UNKNOWN"
        val body = messages.joinToString(separator = "") { it.displayMessageBody ?: "" }
        if (body.isBlank()) return
        PayGuardSmsModule.current?.notifySms(sender, body)
    }
}