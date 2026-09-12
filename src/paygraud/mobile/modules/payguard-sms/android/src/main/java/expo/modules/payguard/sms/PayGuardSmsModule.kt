package expo.modules.payguard.sms

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Bridges every incoming SMS into a JS event.
 * Only active while the app is subscribed (OnStartObserving / EventEmitter.addListener).
 */
class PayGuardSmsModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("PayGuardSms")
        Events("onSmsReceived")

        OnStartObserving {
            PayGuardSmsModule.current = this
        }

        OnStopObserving {
            PayGuardSmsModule.current = null
        }
    }

    internal fun notifySms(sender: String, body: String) {
        sendEvent("onSmsReceived", mapOf("sender" to sender, "body" to body))
    }

    companion object {
        @Volatile
        var current: PayGuardSmsModule? = null
            private set
    }
}