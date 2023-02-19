[System.Reflection.Assembly]::LoadWithPartialName("Microsoft.Web.Deployment")  | out-null;

function Deploy-Website {
	param(		
		$computer,
		$destPath
	)

	$base_directory = Resolve-Path . 
    $release_src = "$base_directory\dist\dev"
	Sync-Provider -computer $computer -srcPath $release_src -destPath $destPath
}

function Sync-Provider { 
	param(
		$computer,
        $srcPath,
		$destPath
	)

	$destBaseOptions   = new-object Microsoft.Web.Deployment.DeploymentBaseOptions
	$syncOptions       = new-object Microsoft.Web.Deployment.DeploymentSyncOptions
	$deploymentObject = [Microsoft.Web.Deployment.DeploymentManager]::CreateObject("dirPath", $srcPath)

	$destBaseOptions.ComputerName = $computer

	write-host($computer)

	$deploymentObject.SyncTo("dirPath",$destPath,$destBaseOptions,$syncOptions)
}

Export-ModuleMember -Function "Deploy-Website"
